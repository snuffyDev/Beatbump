import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url, params, routeId, fetch }) => {
	const response = await fetch(`/explore/${params.slug}.json`);
	const { sections, header, type } = await response.json();
	let path = url.pathname;
	// console.log(routeId, params, path, sections, header, type);
	return {
		sections,
		header,
		type,
		path,
	};
};
