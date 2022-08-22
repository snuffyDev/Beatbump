import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, url, parent }) => {
	const data = await fetch("/explore.json?browseId=FEmusic_moods_and_genres");
	const response = await data.json();

	if (!data.ok) {
		throw error(500, data.statusText);
	}
	const path = await (await parent()).page;
	return {
		response,
		path,
	};
};
