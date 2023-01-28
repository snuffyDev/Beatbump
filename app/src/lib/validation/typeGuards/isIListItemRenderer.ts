import type { ICarousel, MoodsAndGenresItem } from "$lib/types";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";

export const isMoodsAndGenres = (obj: unknown): obj is ICarousel<MoodsAndGenresItem> => {
	return (obj as ICarousel<MoodsAndGenresItem>).results[0].color !== undefined;
};

export const isValidCarousel = (obj: unknown): obj is ICarousel<IListItemRenderer> => {
	return !!(obj as ICarousel<IListItemRenderer>).results[0].title;
};
