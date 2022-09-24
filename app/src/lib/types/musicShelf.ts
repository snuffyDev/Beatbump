import type { IListItemRenderer } from "./musicListItemRenderer";

export interface MusicShelf {
	header?: {
		title: string;
	};
	contents: IListItemRenderer[];
}
