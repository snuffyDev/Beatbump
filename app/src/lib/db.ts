const browser = typeof globalThis !== "undefined";

import type { Item } from "./types";
import { notify } from "./utils/utils";
import { generateId } from "./utils/strings";
import { getPlaylists, getFavorites, setMultipleFavorites, setMultiplePlaylists } from "./workers/db/db";
import { IDBService } from "./workers/db/service";
import type {
	IDBPlaylist,
	IDBPlaylistInternal,
	IDBRequestTarget,
	IDBStoreKeys,
	IObjectStores,
} from "./workers/db/types";

const MIGRATION_DATA: { [key in IDBStoreKeys]?: IDBPlaylistInternal[] } = {};

export class IDB {
	private $$: Promise<IDBDatabase> | undefined;
	constructor(private DB_NAME: string, private DB_VER: number = 1) {}

	private init(): void {
		if (this.$$) {
			return;
		}
		this.$$ = new Promise((resolve, reject) => {
			const request = indexedDB.open(this.DB_NAME, this.DB_VER);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result);

			request.onupgradeneeded = () => {
				if (request.result.objectStoreNames.contains("playlists")) {
					const storeTx = request.transaction.objectStore("playlists").getAll();
					storeTx.onsuccess = (event: IDBRequestTarget) => {
						if (Array.isArray(event.target.result)) {
							MIGRATION_DATA.playlists = [...event.target.result];
							request.result.deleteObjectStore("playlists");
						}
						request.result.createObjectStore("playlists", { keyPath: "id" } as IObjectStores["playlists"]);
					};
				}
				if (!request.result.objectStoreNames.contains("favorites")) {
					request.result.createObjectStore("favorites", {
						keyPath: "videoId" || "playlistId",
					});
				}
				if (!request.result.objectStoreNames.contains("playlists")) {
					request.result.createObjectStore("playlists", {
						keyPath: "id",
					});
				}
			};
		});
	}
	public transaction<K = unknown, T extends (store: IDBObjectStore) => K = (store: IDBObjectStore) => K>(
		store: IDBStoreKeys,
		type: IDBTransactionMode,
		callback: T,
	): Promise<K | void> {
		if (!browser) {
			return;
		}

		this.init();
		return (this.$$ as Promise<IDBDatabase>).then(
			(db) =>
				new Promise<K | void>((resolve, reject) => {
					const tx = db.transaction(store, type);
					tx.oncomplete = () => resolve();
					tx.onabort = tx.onerror = () => reject(tx.error);

					callback(tx.objectStore(store));
				}),
		);
	}
}

interface ExportDBResult {
	favorites?: Item[];
	playlists?: IDBPlaylist[];
}
export async function exportDB() {
	if (!browser) return;
	try {
		const result: ExportDBResult = {};
		const [playlists, favorites] = await Promise.all([getPlaylists(), getFavorites()]);
		result.favorites = favorites.data ?? undefined;
		result.playlists = playlists.data ?? undefined;
		const file = new Blob([JSON.stringify(result)], { type: "application/json" });

		const fileName = `beatbump-db${generateId(9, "normal")}.json`;
		const url = URL.createObjectURL(file);

		const linkElm = document.createElement("a");

		linkElm.setAttribute("href", url);
		linkElm.download = fileName;

		document.body.appendChild(linkElm);

		linkElm.click();

		document.body.removeChild(linkElm);
		URL.revokeObjectURL(url);

		notify(`Successfully exported your data with the file name: ${fileName}`, "success");
	} catch (err) {
		notify("Error exporting data: " + err, "error");
	}
}

export async function importDB(data: File) {
	try {
		const jsonString = await data.text();
		const json = JSON.parse(jsonString) as ExportDBResult;
		if (!json.favorites && !json.playlists) throw new Error("Provided file is not a valid DB JSON object");

		Promise.allSettled([await setMultiplePlaylists(json?.playlists), await setMultipleFavorites(json?.favorites)]).then(
			() => {
				notify(`Successfully imported database from JSON`, "success");
			},
		);
	} catch (err) {
		notify("Error importing data: " + err, "error");
	}
}
