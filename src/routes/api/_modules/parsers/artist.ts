import { ArtistPageParser } from "$lib/js/artist";

import type { ICarousel } from "$lib/types";

export const parseArtist = (data) => {
	const {
		header,

		contents: {
			singleColumnBrowseResultsRenderer: {
				tabs: [
					{
						tabRenderer: {
							content: { sectionListRenderer: { contents = [] } = {} } = {}
						} = {}
					} = {}
				] = []
			} = {}
		} = {}
	} = data;
	// console.log(header)
	return ArtistPageParser({ header, items: contents });
};
