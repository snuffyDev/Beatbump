/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { browser } from "$app/env";
import type { Item } from "./types";
import type { Dict } from "./types/utilities";
import { filter, generateId, iter, notify, splice } from "./utils";

export interface IObjectStores {
	playlists: { keyPath: "id" };
	favorites: { keyPath: "videoId" | "id" };
}
export interface IDBPlaylist {
	name?: string;
	description?: string;
	thumbnail?: any;
	items?: Item | Item[];
	id?: string;
}

export interface IDBPlaylistInternal extends IDBPlaylist {
	length?: number;
	hideAlert?: boolean;
}

type IDBRequestTarget = Event & {
	target: EventTarget & { result: IDBRequest & IDBCursorWithValue };
};
type Keys = "playlists" | "favorites";

const MIGRATION_DATA: { [key in Keys]?: IDBPlaylistInternal[] } = {};

class IDB {
	private $$: Promise<IDBDatabase> | undefined;
	constructor(private DB_NAME: string, private DB_VER: number = 1) {
		if (!browser) return;
	}

	private init(): void {
		if (!browser) return;
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
		store: Keys,
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

const db = new IDB("beatbump", 2);

export function updatePlaylist(entry: IDBPlaylistInternal): Promise<void> {
	return db.transaction("playlists", "readwrite", (store) => {
		try {
			const cursorReq = store.openCursor(entry.id);
			cursorReq.onsuccess = (event: IDBRequestTarget) => {
				const cursor = event.target.result;
				if (cursor) {
					cursor.update({
						...cursor.value,
						name: entry?.name ?? cursor?.value?.name,
						thumbnail: entry?.thumbnail ?? cursor?.value?.thumbnail,
						description: entry?.description ?? cursor?.value?.description,
						length: Array.isArray(entry?.items) ? entry?.items.length : cursor?.value?.items.length,
						items: Array.isArray(entry?.items) ? [...entry.items] : [...cursor.value.items],
					});
				}
				if (!entry.hideAlert) notify("Successfully updated playlist!", "success");
				return event?.target;
			};
		} catch (error) {
			notify("Failed to update playlist. Reason: " + error, "error");
		}
	});
}

export function createNewPlaylist(entry: IDBPlaylist): Promise<void> {
	return db.transaction("playlists", "readwrite", (store) => {
		try {
			const result = store.put(
				Object.assign(entry, {
					id: generateId(32),
					length: Array.isArray(entry?.items) ? [...entry.items].length : [entry?.items].length,
				}),
			);
			result.onsuccess = () => {
				notify("Created Playlist!", "success");
			};
			result.onerror = () => {
				notify("Error: " + result.error, "error");
			};
		} catch (err) {
			notify("Error: " + err, "error");
		}
	});
}

export function setNewFavorite(item: Item): Promise<void> {
	return db.transaction("favorites", "readwrite", (store) => {
		try {
			const request = store.put(item);

			request.onsuccess = () => {
				notify("Added to favorites!", "success");
			};
		} catch (error) {
			notify("Error setting favorite. Reason: " + error, "error");
		}
	});
}

export function setMultipleFavorites(items: Item[]): Promise<void> {
	return db.transaction("favorites", "readwrite", (store) => {
		try {
			iter(items, (item) => store.put(item));
			store.transaction.oncomplete = () => {
				notify("Added items to favorites!", "success");
			};
			store.transaction.onerror = () => {
				notify("Error adding items to favorites. Reason: " + store.transaction.error, "error");
			};
		} catch (error) {
			notify("Error adding items to favorites. Reason: " + error, "error");
		}
	});
}

export function setMultiplePlaylists(items: Item[] = []): Promise<void> {
	return db.transaction("playlists", "readwrite", (store) => {
		try {
			iter(items, (item) => store.put(item));
			store.transaction.oncomplete = () => {
				notify(`Added ${items.length} new playlists!`, "success");
			};
			store.transaction.onerror = () => {
				notify("Error creating new playlists. Reason: " + store.transaction.error, "error");
			};
		} catch (error) {
			notify("Error creating new playlists. Reason: " + error, "error");
		}
	});
}

export function deleteFavorite(item: Item): Promise<void> | Error {
	if (!item) return new Error("No item was provided!");

	return db.transaction("favorites", "readwrite", (store) => {
		try {
			store.delete(item.videoId || item.playlistId);
			notify("Item removed from favorites!", "success");
		} catch (error) {
			notify("Error removing item from favorites. Reason: " + error, "error");
		}
	});
}

export function deletePlaylist(name: string): Promise<void> | Error {
	if (!name) return new Error("No playlist name was provided!");

	return db.transaction("playlists", "readwrite", (store) => {
		try {
			store.delete(name);
			notify("Deleted playlist!", "success");
		} catch (error) {
			notify("Error deleting playlist. Reason: " + error, "error");
		}
	});
}

export function deleteAllPlaylists(): Promise<void> {
	return db.transaction("playlists", "readwrite", (store) => {
		try {
			store.clear().onsuccess = () => {
				notify("Deleted playlists!", "success");
			};
		} catch (error) {
			notify("Error deleting playlists. Reason: " + error, "error");
		}
	});
}

export function deleteSongFromPlaylist(playlistId: string, videoId: string): Promise<void> {
	return db.transaction("playlists", "readwrite", (store) => {
		try {
			const playlistCursor = store.openCursor(playlistId);
			playlistCursor.onsuccess = (event: IDBRequestTarget) => {
				const entry = event.target.result;
				if (entry) {
					const playlist = entry.value;
					const req = entry.update({
						...playlist,
						length: playlist.length--,
						items:
							filter(playlist.items, (item: Item) => {
								return item.videoId && item.videoId !== videoId;
							}) || [],
					});
					req.onsuccess = () => {
						notify("Removed song from playlist!", "success");
					};
				}
			};
		} catch (error) {
			notify("Error: " + error, "error");
		}
	});
}

export function getFavorites(): Promise<Item[]> {
	let results = [];
	return db
		.transaction("favorites", "readwrite", (store) => {
			try {
				const request = store.getAll();
				request.onsuccess = (event: IDBRequestTarget) => {
					if (Array.isArray(event?.target?.result)) {
						results = event.target.result as Item[];
					}
				};
			} catch (error) {
				console.error(error);
				notify(error, "error");
			}
		})
		.then(() => {
			return results;
		});
}

export function getPlaylist(id: string): Promise<IDBPlaylist> {
	let results: Dict<any>;
	return db
		.transaction("playlists", "readwrite", (store) => {
			try {
				const request = store.openCursor(id);
				request.onsuccess = (event: IDBRequestTarget) => {
					results = event.target.result.value;
					console.log(results);
				};
				return results;
			} catch (error) {
				console.error(error);
				notify(error, "error");
			}
		})
		.then(() => {
			return results;
		});
}

export function getPlaylists(): Promise<IDBPlaylist[]> {
	let results = [];
	return db
		.transaction("playlists", "readwrite", (store) => {
			try {
				if (MIGRATION_DATA["playlists"] && Array.isArray(MIGRATION_DATA["playlists"])) {
					iter(MIGRATION_DATA["playlists"], (item) => {
						store.put(item);
					});
				}
				const request = store.getAll();
				request.onsuccess = (event: IDBRequestTarget) => {
					if (Array.isArray(event?.target?.result)) {
						results = event.target.result;
						iter(results, (item, idx) => {
							// Ensure playlist has a proper id
							if (!item.id) {
								results[idx].id = generateId(32);
								store.put({ ...results[idx] });
							}
							/** Ensure merged playlists do not
							 *  create an array within an array
							 *  [[]]
							 *  */
							if (Array.isArray(item?.items) && item?.items.length !== 0) {
								const length = item?.items.length;
								let subIdx = -1;
								for (; ++subIdx < length; ) {
									if (Array.isArray(item?.items[subIdx])) {
										const illegalArray = item?.items[subIdx];

										splice(results[idx].items, length, 1);
										results[idx].items = [...item.items, ...(illegalArray as Array<any>)];
									}
								}
								results[idx].length = item?.items.length ?? item?.length;
								store.put({ ...results[idx] });
							}
						});
					}
				};
			} catch (error) {
				console.error(error);
				notify(error, "error");
			}
		})
		.then(() => {
			return results;
		});
}
