import type { MoodsAndGenresItem } from "$lib/types";
import { error } from "@sveltejs/kit";
import type { ParsedCarousel } from "../api/_lib/models/Carousel";

export const load = async ({ fetch }) => {
	const response = await fetch<{
		carouselItems: (ParsedCarousel & {
			items: (ParsedCarousel["items"][number] | MoodsAndGenresItem)[];
		})[];
	}>("/trending.json?q=browse").then((res) => {
		if (!res.ok) {
			throw error(res.status, res.statusText);
		}
		return res.json();
	});

	return response;
};
