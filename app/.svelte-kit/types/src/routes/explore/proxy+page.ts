import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
// throw new Error("@migration task: Migrate the load function input (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693)");
export const load = async ({ fetch, url, parent }: Parameters<PageLoad>[0]) => {
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
