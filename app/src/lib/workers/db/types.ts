import type { Item } from "$lib/types";

export type Actions = "create" | "get" | "update" | "delete";

export interface Methods {
	updatePlaylist: (entry: IDBPlaylistInternal) => Promise<IDBMessage<void>>;
	deletePlaylist: (name: string) => Promise<IDBMessage<void>>;
	createPlaylist: (entry: IDBPlaylist) => Promise<IDBMessage<void>>;
	deleteFavorite: (item: Item) => Promise<IDBMessage<void>>;
	getFavorites: () => Promise<IDBMessage<Item[]>>;
	getPlaylist: (id: string) => Promise<IDBMessage<IDBPlaylist>>;
	getPlaylists: () => Promise<IDBMessage<IDBPlaylist[]>>;
	createFavorite: (item: Item) => Promise<IDBMessage<void>>;
}

export interface IObjectStores {
	playlists: { keyPath: "id" };
	favorites: { keyPath: "videoId" | "id" };
}
export interface IDBPlaylist {
	name?: string;
	description?: string;
	thumbnail?: any;
	items?: Item[];
	id?: string;
}

export interface IDBPlaylistInternal extends IDBPlaylist {
	length?: number;
	hideAlert?: boolean;
}

export type IDBRequestTarget = Event & {
	target: EventTarget & { result: IDBRequest & IDBCursorWithValue };
};
export type IDBStoreKeys = "playlists" | "favorites";

export interface IDBMessage<T = unknown> {
	error?: boolean;
	data?: T;
	message?: string;
}
