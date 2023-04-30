import type { ParsedCarousel } from "$api/models/Carousel";
import type { ICarousel, MoodsAndGenresItem } from "$lib/types";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";

export const isMoodsAndGenres = (obj: unknown): obj is ParsedCarousel<"moodsAndGenres"> => {
	return (obj as ParsedCarousel<"moodsAndGenres">)?.items?.[0]?.color !== undefined;
};

export const isValidCarousel = (obj: unknown): obj is ParsedCarousel => {
	return !!(obj as ParsedCarousel).items?.[0]?.title;
};
