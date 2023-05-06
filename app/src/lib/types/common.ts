import type { Item } from "$lib/types";

export type BuildMenuParams = {
	item: Item;
	dispatch: (...args: any[]) => void;
	page: string;
	idx: number;
	SITE_ORIGIN_URL: string;
};
