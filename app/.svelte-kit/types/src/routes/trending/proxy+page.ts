// @ts-nocheck
import type { ICarousel, MoodsAndGenresItem } from "$lib/types";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";

export const load = async ({ fetch }: Parameters<PageLoad>[0]) => {
	const response = await fetch<{ carouselItems: ICarousel<IListItemRenderer | MoodsAndGenresItem>[] }>(
		"/trending.json?q=browse",
	);
	const data = await response.json();
	if (!response.ok) {
		throw error(response.status, response.statusText);
	}
	const { carouselItems } = data;

	return {
		carouselItems,
	};
};
