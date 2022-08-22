import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
let path;

export const load: PageLoad = async ({ fetch, data: data$1, url }) => {
	// console.time("startLoad");
	const response = await fetch("/home.json");
	const data = await response.json();
	if (!response.ok) {
		throw error(500, `Error: ${response.statusText}`);
	}
	// console.timeEnd("startLoad");
	const { carousels, headerThumbnail = undefined, continuations, visitorData } = data;
	path = url.pathname;

	return {
		carousels,
		headerThumbnail,
		continuations,
		visitorData,
		path,
	};
};
