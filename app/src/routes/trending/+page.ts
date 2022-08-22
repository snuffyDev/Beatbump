import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";
import type { ICarousel } from "$lib/types";

export const load: PageLoad = async ({ fetch }): Promise<{ carouselItems: ICarousel[] }> => {
	const response = await fetch("/trending.json?q=browse");
	const data: { carouselItems: ICarousel[] } = await response.json();
	if (!response.ok) {
		throw error(response.status, response.statusText);
	}
	const { carouselItems } = data;

	return {
		carouselItems,
	};
};
