import type { NextContinuationData } from "$lib/types";
import type { Header } from "$lib/types/playlist";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import type { Maybe } from "$lib/utils";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
export const load: PageLoad = async ({
	params,
	url,
	fetch,
}): Promise<{
	tracks: IListItemRenderer[];
	header: Header;
	id: string;
	continuations: Maybe<NextContinuationData>;
	carouselContinuations: Maybe<NextContinuationData>;
	visitorData: string;
	key: string;
}> => {
	const { slug } = params;
	const response = await fetch(`/api/v1/playlist.json?list=${slug}`);
	const data = await response.json();

	// console.log(data);
	const { tracks = [], header = {}, continuations = {}, carouselContinuations, visitorData } = await data;
	if (!response.ok) {
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
