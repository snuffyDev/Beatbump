import type { NextContinuationData } from "$lib/types";
import type { Header } from "$lib/types/playlist";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import type { Maybe } from "$lib/utils";
import { error } from "@sveltejs/kit";
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
	const data = await fetch<PlaylistResponseBody>(
		`/api/v1/playlist.json?list=${slug}`,
	)
		.then((response) => {
			if (!response.ok) {
				throw error(response.status, response.statusText);
			}
			return response.json();
		})
		.catch((r) => {
			throw r;
		});

	// console.log(data);
	const {
		tracks = [],
		header = {},
		continuations,
		carouselContinuations,
		visitorData,
	} = await data;

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
