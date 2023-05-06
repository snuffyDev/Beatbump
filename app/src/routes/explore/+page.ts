import { error } from "@sveltejs/kit";
export const prerender = false;
export const load = async ({ fetch, url }) => {
	const data = await fetch("/explore.json?browseId=FEmusic_moods_and_genres");
	const response = await data.json();

	if (!data.ok) {
		throw error(500, data.statusText);
	}
	return {
		response,
		path: url.pathname,
	};
};
