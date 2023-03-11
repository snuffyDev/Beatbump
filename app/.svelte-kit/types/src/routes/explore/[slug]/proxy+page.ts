// @ts-nocheck
import type { PageLoad } from "./$types";

export const load = async ({ url, params, fetch }: Parameters<PageLoad>[0]) => {
	const response = await fetch(`/explore/${params.slug}.json`);
	const { sections, data, header, type } = await response.json();
	let path = url.pathname;
	// console.log(routeId, params, path, sections, header, type);
	return {
		sections,
		header,
		data,
		type,
		path,
	};
};
