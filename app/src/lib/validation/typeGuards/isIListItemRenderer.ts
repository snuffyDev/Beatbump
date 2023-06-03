import type { ParsedCarousel } from "$api/models/Carousel";

export const isMoodsAndGenres = (
	obj: unknown,
): obj is ParsedCarousel<"moodsAndGenres"> => {
	return !!(obj as ParsedCarousel<"moodsAndGenres">)?.items?.length;
};

export const isValidCarousel = (obj: unknown): obj is ParsedCarousel => {
	return !!(obj as ParsedCarousel).items?.[0]?.title;
};
