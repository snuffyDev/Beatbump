import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, data: data$1, url }) => {
	// console.count("CONNECTION!");
	const response = await fetch("/home.json");
	const data = await response.json();
	if (!response.ok) {
		throw error(500, `Error: ${response.statusText}`);
	}
	const { carousels, headerThumbnail = undefined, continuations, visitorData } = data;

	return {
		carousels,
		headerThumbnail,
		continuations,
		visitorData,
		path: url.pathname,
	};
};
