/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
// import { browser } from "$app/environment";
import { IDB } from "./../../db";
import type { Item } from "../../types";
import { filter, iter } from "../../utils/collections";
import { generateId } from "../../utils/strings";
import type {
	IDBPlaylistInternal,
	IDBRequestTarget,
	IDBPlaylist,
	Actions,
	IDBStoreKeys,
	IDBMessage,
	Methods,
} from "./types";

const MIGRATION_DATA: { [key in IDBStoreKeys]?: IDBPlaylistInternal[] } = {};

const db = new IDB("beatbump", 3);

export function updatePlaylist(entry: IDBPlaylistInternal): Promise<IDBMessage<IDBPlaylist>> {
	let result: IDBMessage;
	return new Promise<IDBMessage<IDBPlaylist>>((resolve) => {
		db.transaction("playlists", "readwrite", (store) => {
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

					if (!entry.hideAlert) {
						resolve({
							message: "Successfully updated playlist!",
						});
						return;
					}
					resolve({
						data: event?.target.result as IDBPlaylist,
					});
				};
			} catch (error) {
				resolve({
					error: true,
					message: "Failed to update playlist. Reason: " + error,
				});
			}
		});
	});
}

export function createNewPlaylist(entry: IDBPlaylist): Promise<IDBMessage<void>> {
	return new Promise<IDBMessage<void>>((resolve) => {
		db.transaction("playlists", "readwrite", (store) => {
			try {
				const result = store.put(
					Object.assign(entry, {
						id: generateId(32),
						length: Array.isArray(entry?.items) ? [...entry.items].length : [entry?.items].length,
					}),
				);
				result.onsuccess = () => {
					resolve({ message: "Created Playlist!" });
				};
				result.onerror = () => {
					resolve({ error: true, message: "Error: " + result.error });
				};
			} catch (err) {
				resolve({ message: "Error: " + err });
			}
		});
	});
}

export function setNewFavorite(item: Item): Promise<IDBMessage<void>> {
	return new Promise<IDBMessage<void>>((resolve) => {
		db.transaction("favorites", "readwrite", (store) => {
			try {
				const request = store.put(item);

				request.onsuccess = () => {
					resolve({ message: "Added to favorites!" });
				};
			} catch (error) {
				resolve({ message: "Error setting favorite. Reason: " + error });
			}
		});
	});
}

export function setMultipleFavorites(items: Item[]): Promise<IDBMessage<void>> {
	if (Array.isArray(items) && !items.length) return;
	return new Promise<IDBMessage<void>>((resolve) => {
		return db.transaction("favorites", "readwrite", (store) => {
			try {
				iter(items, (item) => store.put(item));
				store.transaction.oncomplete = () => {
					resolve({ message: "Added items to favorites!" });
				};
				store.transaction.onerror = () => {
					resolve({ message: "Error adding items to favorites. Reason: " + store.transaction.error });
				};
			} catch (error) {
				resolve({ message: "Error adding items to favorites. Reason: " + error });
			}
		});
	});
}

export function setMultiplePlaylists(items: IDBPlaylist[] = []): Promise<IDBMessage<void>> {
	if (Array.isArray(items) && !items.length) return;
	return new Promise<IDBMessage<void>>((resolve) => {
		return db.transaction("playlists", "readwrite", (store) => {
			try {
				iter(items, (item) => store.put(item));
				store.transaction.oncomplete = () => {
					resolve({ message: `Added ${items.length} new playlists!` });
				};
				store.transaction.onerror = () => {
					resolve({ message: "Error creating new playlists. Reason: " + store.transaction.error });
				};
			} catch (error) {
				resolve({ message: "Error creating new playlists. Reason: " + error });
			}
		});
	});
}

export function deleteFavorite(item: Item): Promise<IDBMessage<void>> {
	if (!item) throw new Error("No item was provided!");
	return new Promise<IDBMessage<void>>((resolve) => {
		return db.transaction("favorites", "readwrite", (store) => {
			try {
				store.delete(item.videoId || item.playlistId);
				resolve({ message: "Item removed from favorites!" });
			} catch (error) {
				resolve({ message: "Error removing item from favorites. Reason: " + error });
			}
		});
	});
}

export function deletePlaylist(name: string): Promise<IDBMessage<void>> {
	if (!name) throw new Error("No playlist name was provided!");
	return new Promise<IDBMessage<void>>((resolve) => {
		return db.transaction("playlists", "readwrite", (store) => {
			try {
				store.delete(name);
				resolve({ message: "Deleted playlist!" });
			} catch (error) {
				resolve({ message: "Error deleting playlist. Reason: " + error });
			}
		});
	});
}

export function deleteAllPlaylists(): Promise<IDBMessage<void>> {
	return new Promise<IDBMessage<void>>((resolve) => {
		return db.transaction("playlists", "readwrite", (store) => {
			try {
				store.clear().onsuccess = () => {
					resolve({ message: "Deleted playlists!" });
				};
			} catch (error) {
				resolve({ message: "Error deleting playlists. Reason: " + error });
			}
		});
	});
}

export function deleteSongFromPlaylist(playlistId: string, videoId: string): Promise<IDBMessage<void>> {
	return new Promise<IDBMessage<void>>((resolve) => {
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
							resolve({ message: "Removed song from playlist!" });
						};
					}
				};
			} catch (error) {
				resolve({ message: "Error: " + error });
			}
		});
	});
}

export function getFavorites(): Promise<IDBMessage<Item[]>> {
	let results = [];
	return new Promise<IDBMessage<Item[]>>((resolve) => {
		return db.transaction("favorites", "readwrite", (store) => {
			try {
				const request = store.getAll();
				request.onsuccess = (event: IDBRequestTarget) => {
					if (Array.isArray(event?.target?.result)) {
						resolve({ data: event.target.result });
					}
				};
			} catch (error) {
				resolve({ message: error });
			}
		});
	});
}

export function getPlaylist(id: string): Promise<IDBMessage<IDBPlaylist>> {
	return new Promise<IDBMessage<IDBPlaylist>>((resolve) => {
		return db.transaction("playlists", "readwrite", (store) => {
			try {
				const request = store.openCursor(id);
				request.onsuccess = (event: IDBRequestTarget) => {
					resolve({ data: event.target.result.value });
				};
				request.onerror = (e) => {};
			} catch (error) {
				console.error(error);
				resolve({ message: error });
			}
		});
	});
}

export function getPlaylists(): Promise<IDBMessage<IDBPlaylist[]>> {
	return new Promise<IDBMessage<IDBPlaylist[]>>((resolve) => {
		db.transaction("playlists", "readwrite", (store) => {
			try {
				if (MIGRATION_DATA["playlists"] && Array.isArray(MIGRATION_DATA["playlists"])) {
					iter(MIGRATION_DATA["playlists"], (item) => {
						store.put(item);
					});
				}
				const request = store.getAll();
				request.onsuccess = (event: IDBRequestTarget) => {
					let results = [];
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
								let subIdx = length;
								while (subIdx--) {
									if (Array.isArray(item?.items[subIdx])) {
										const illegalArray = item?.items[subIdx];

										results[idx].items.splice(subIdx, 1);
										results[idx].items = [...results[idx].items, ...(illegalArray as Array<any>)];
									}
								}
								results[idx].length = item?.items.length ?? item?.length;
								store.put({ ...results[idx] });
							}
						});
						resolve({ data: results });
					}
				};
			} catch (error) {
				console.error(error);
				resolve({ message: error });
			}
		});
	});
}

const methods = {
	updatePlaylist,
	deletePlaylist,
	createPlaylist: createNewPlaylist,
	deleteFavorite,
	getFavorites,
	getPlaylist,
	getPlaylists,
	deletePlaylists: deleteAllPlaylists,
	createFavorite: setNewFavorite,
};

export const dbHandler = <
	Action extends Actions = any,
	Type extends "favorite" | "playlist" | "playlists" | "favorites" = any,
	Key extends keyof Methods & `${Action & string}${Capitalize<Type>}` = keyof Methods &
		`${Action & string}${Capitalize<Type>}` &
		string,
	Fn extends Methods[Key] = Methods[Key],
>(
	action: Action,
	type: Type,
	...params: Parameters<Fn>
): ReturnType<Fn> => {
	const funcName = `${action}${type[0].toUpperCase() + type.slice(1)}`;

	return methods[`${funcName}`](...params);
};
