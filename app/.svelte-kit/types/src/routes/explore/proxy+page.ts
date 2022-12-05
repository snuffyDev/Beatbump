// @ts-nocheck
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load = async ({ fetch, url, parent }: Parameters<PageLoad>[0]) => {
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
