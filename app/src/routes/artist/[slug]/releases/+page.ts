import type { CarouselItem } from "$lib/types";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
export const load: PageLoad = (async ({
	fetch,
	url,
	params,
}): Promise<{
	header: { artist?: string; type?: string };
	contents?: CarouselItem[];
}> => {
	// let browseId = url.searchParams.get("browseId");
	const qparams = url.searchParams.get("params");
	const itct = url.searchParams.get("itct");
	const visitorData = url.searchParams.get("visitorData");
	const response = await fetch(
		`/artist/${
			params.slug
		}/releases.json?visitorData=${visitorData}&params=${qparams}&itct=${encodeURIComponent(
			itct,
		)}`,
	);
	if (!response.ok) {
		throw error(500, response.statusText);
	}
	const data = await response.json();
	const { header, contents } = data;
	return {
		header: header,
		contents: contents,
	};
}) satisfies PageLoad;
