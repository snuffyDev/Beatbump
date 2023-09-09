import type { Item } from "$lib/types";

export type Actions = "create" | "get" | "update" | "delete";

export interface Methods {
	createFavorite: (item: Item) => Promise<IDBMessage<void>>;
	createPlaylist: (entry: IDBPlaylist) => Promise<IDBMessage<void>>;
	deleteFavorite: (item: Item) => Promise<IDBMessage<void>>;
	deletePlaylist: (name: string) => Promise<IDBMessage<void>>;
	getFavorites: () => Promise<IDBMessage<Item[]>>;
	getPlaylist: (id: string) => Promise<IDBMessage<IDBPlaylist>>;
	getPlaylists: () => Promise<IDBMessage<IDBPlaylist[]>>;
	updatePlaylist: (entry: IDBPlaylistInternal) => Promise<IDBMessage<void>>;
}

export interface IObjectStores {
	favorites: { keyPath: "videoId" | "id" };
	playlists: { keyPath: "id" };
}
export interface IDBPlaylist {
	description?: string;
	id?: string;
	items?: Item[];
	name?: string;
	thumbnail?: any;
}

export interface IDBPlaylistInternal extends IDBPlaylist {
	hideAlert?: boolean;
	length?: number;
}

export type IDBRequestTarget = Event & {
	target: EventTarget & { result: IDBRequest & IDBCursorWithValue };
};
export type IDBStoreKeys = "playlists" | "favorites";

export interface IDBMessage<T = unknown> {
	data?: T;
	error?: boolean;
	message?: string;
}
