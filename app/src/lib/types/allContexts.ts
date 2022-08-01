import type { Nullable } from "$lib/types";

export interface ListItemCtx {
	page: "playlist" | "queue" | "artist" | "release" | "library";
	parentPlaylistId?: Nullable<string>;
	innerWidth?: number;
}
