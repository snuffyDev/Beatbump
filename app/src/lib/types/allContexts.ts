import type { Nullable } from "$lib/types";

export type PageContext =
	| "playlist"
	| "queue"
	| "artist"
	| "release"
	| "library"
	| "browse";
export interface ListItemCtx {
	parentPlaylistId: Nullable<string>;
	innerWidth?: number;
	visitorData: string;
}
