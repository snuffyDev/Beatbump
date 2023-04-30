import type { CarouselHeader } from "$lib/types";
import type { ICarouselTwoRowItem } from "$lib/types/musicCarouselTwoRowItem";
import type { BaseItem } from "./BaseItem";

export interface ParsedGrid extends BaseItem {
	header: CarouselHeader;
	items: ICarouselTwoRowItem[];
	type: "grid";
}
