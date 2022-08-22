import type { CarouselItem } from "$lib/types";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
export const load: PageLoad = async ({
	fetch,
	url,
}): Promise<{ header: { artist?: string; type?: string }; contents?: CarouselItem[] }> => {
	let browseId = url.searchParams.get("browseId");
	let params = url.searchParams.get("params");
	let itct = url.searchParams.get("itct");
	let visitorData = url.searchParams.get("visitorData");
	const response = await fetch(
		`/artist/releases.json?browseId=${browseId}&visitorData=${visitorData}&params=${params}&itct=${encodeURIComponent(
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
};
