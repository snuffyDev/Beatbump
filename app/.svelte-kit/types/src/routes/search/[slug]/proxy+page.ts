import type { PageLoad } from "./$types";

let path;

export const load = async ({ url, params, fetch }: Parameters<PageLoad>[0]) => {
	const slug = params.slug;
	const filter = url.searchParams.get("filter") || "";
	path = url.pathname;
	// console.log(filter, page, slug)
	const apiUrl = `/api/search.json?q=${encodeURIComponent(slug)}${
		filter !== "" ? `&filter=${encodeURIComponent(filter)}` : ""
	}`;
	const response = await fetch(apiUrl);
	const data = await response.json();
	const { results = [], continuation = {}, didYouMean, error } = await data;

	if (response.ok) {
		return {
			filter: filter,
			contents: results,
			continuation: continuation,
			didYouMean: didYouMean,
			error,
			path,
		};
	}
};
