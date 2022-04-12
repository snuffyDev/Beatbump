import { ArtistPageParser } from "$lib/js/artist";

import type { ICarousel } from "$lib/types";

export const parseArtist = (data) => {
	const {
		header,
		responseContext,
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
	// console.log(responseContext);
	return ArtistPageParser({
		header,
		items: contents,
		visitorData: responseContext["visitorData"]
	});
};
