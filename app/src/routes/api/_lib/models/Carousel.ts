import type { CarouselHeader, MoodsAndGenresItem } from "$lib/types";
import type { ICarouselTwoRowItem } from "$lib/types/musicCarouselTwoRowItem";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import type { BaseItem } from "./BaseItem";

export interface ParsedCarousel<
	T extends "moodsAndGenres" | "listItem" | "twoRowItem" = "twoRowItem",
> extends BaseItem {
	header: CarouselHeader;
	items: T extends "twoRowItem"
		? ICarouselTwoRowItem[]
		: T extends "listItem"
		? IListItemRenderer[]
		: T extends "moodsAndGenres"
		? MoodsAndGenresItem[]
		: never;
	type: "carousel";
}
