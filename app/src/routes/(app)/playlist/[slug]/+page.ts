import type { NextContinuationData } from "$lib/types";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import type { Header } from "$lib/types/playlist";
import type { Maybe } from "$lib/utils";
import type { PlaylistResponseBody } from "../../api/v1/playlist.json/+server.js";
export const load = async ({
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
	console.time("playlist");
	const data = await fetch<PlaylistResponseBody>(
		`/api/v1/playlist.json?list=${slug}`,
	).then((response) => {
		if (!response.ok) {
			console.error(response.status, response.statusText);
			throw response.statusText;
		}
		return response.json();
	});

	// console.log(data);
	const {
		tracks = [],
		header = {},
		continuations,
		carouselContinuations,
		visitorData,
	} = await data;

	console.timeEnd("playlist");
	return {
		tracks: tracks,
		visitorData,
		continuations: continuations,
		carouselContinuations,
		header: header,
		id: slug,
		key: url.pathname,
		data,
	};
};
