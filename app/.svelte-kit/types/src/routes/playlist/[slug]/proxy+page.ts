import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
export const load = async ({ params, url, fetch }: Parameters<PageLoad>[0]) => {
	const { slug } = params;
	const response = await fetch(`/api/playlist.json?list=${slug}`);
	const data = await response.json();

	// console.log(data);
	const { tracks = [], header = {}, continuations = {}, carouselContinuations, visitorData } = await data;
	if (!response.ok) {
		// throw new Error(
		// 	"@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693)",
		// );
		console.log("ERROR");
		throw error(response.status, response.statusText);
	}

	return {
		tracks: tracks,
		visitorData,
		continuations: continuations,
		carouselContinuations,
		header: header,
		id: slug,
		key: url.pathname,
	};
};
