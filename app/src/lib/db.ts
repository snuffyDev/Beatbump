const browser = typeof globalThis !== "undefined";

import type { Item } from "./types";
import { notify } from "./utils/utils";
import { generateId } from "./utils/strings";
import { getPlaylists, getFavorites, setMultipleFavorites, setMultiplePlaylists } from "./workers/db/db";

import type { IDBPlaylist } from "./workers/db/types";
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

		await Promise.allSettled([setMultiplePlaylists(json?.playlists), setMultipleFavorites(json?.favorites)])
			.then(() => {
				notify(`Successfully imported database from JSON`, "success");
			})
			.catch((err) => {
				notify("Error importing data: " + err, "error");
			});
	} catch (err) {
		notify("Error importing data: " + err, "error");
	}
}
