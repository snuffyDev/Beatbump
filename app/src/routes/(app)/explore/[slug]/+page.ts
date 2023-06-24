import type { ExploreSlugResponse } from "../[slug].json/+server.js";

export const load = async ({ url, params, fetch }) => {
	const response = await fetch<Awaited<ExploreSlugResponse>>(
		`/explore/${params.slug}.json`,
	).then((response) => response.json());

	const path = url.pathname;
	// console.log(routeId, params, path, sections, header, type);
	return {
		response,
		path,
	} as const;
};
