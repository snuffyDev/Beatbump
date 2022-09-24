import { json as json$1 } from "@sveltejs/kit";
import { MoodsAndGenresItem, MusicResponsiveListItemRenderer, MusicTwoRowItemRenderer } from "$lib/parsers";
import type { CarouselHeader } from "$lib/types";
import type { ICarouselTwoRowItem } from "$lib/types/musicCarouselTwoRowItem";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import type { RequestHandler } from "@sveltejs/kit";

/* eslint-disable prefer-const */

export const GET: RequestHandler = async ({ params }) => {
	const { slug } = params;
	// const ctx = query.get('params') || ''

	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/browse?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30&prettyPrint=false`,
		{
			method: "POST",
			body: JSON.stringify({
				context: {
					// clickTracking: { clickTrackingParams: `${itct}` },
					client: {
						clientName: "WEB_REMIX",
						clientVersion: "0.1",
					},

					user: {
						lockedSafetyMode: false,
					},
				},
				// params: `${ctx}`,
				browseId: `${slug}`,
			}),
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				Origin: "https://music.youtube.com",
			},
		},
	);

	const data = await response.json();
	let {
		header: { musicHeaderRenderer: { title: { runs: [{ text = "" } = {}] = [] } = {} } = {} } = {},
		contents: {
			singleColumnBrowseResultsRenderer: {
				tabs: [{ tabRenderer: { content: { sectionListRenderer: { contents = [] } = {} } = {} } = {} } = {}] = [],
			} = {},
		} = {},
	} = await data;
	let type: string;

	slug.includes("videos") ? (type = "videos") : (type = "albums");
	let carousels = [];
	let grids = [];
	let sections = [];
	for (let index = 0; index < contents.length; index++) {
		const element = { ...contents[index] };

		element?.musicCarouselShelfRenderer && carousels.push(element);
		element?.gridRenderer && grids.push(element);
	}
	if (carousels.length !== 0) {
		for (let index = 0; index < contents.length; index++) {
			const element = contents[index];
			if (element?.musicCarouselShelfRenderer) {
				sections = [...sections, parseCarousel({ ...element })];
			}
		}
	}
	if (grids.length !== 0) {
		sections = grids.map(({ gridRenderer = {} }) => {
			const { items = [], header = {} } = gridRenderer;
			const section = items.map((ctx) => MusicTwoRowItemRenderer(ctx));
			return {
				section,
				type: "grid",
				title: header?.gridHeaderRenderer?.title?.runs[0]?.text,
			};
		});
	}

	const getTitle = () => {
		const wordParts: Array<any> = slug.split("_");
		for (let i = 0; i < wordParts.length; i++) {
			wordParts[i] = wordParts[i][0].toUpperCase() + wordParts[i].substr(1);
		}
		wordParts.join(" ");
		const final = wordParts.shift();
		return wordParts.join(" ");
	};
	// console.log(sections)
	return json$1({ title: getTitle(), sections, header: text, data });
};

function parseHeader({ musicCarouselShelfBasicHeaderRenderer }): CarouselHeader {
	if (musicCarouselShelfBasicHeaderRenderer) {
		let subheading, browseId;
		if (musicCarouselShelfBasicHeaderRenderer?.strapline?.runs[0]?.text) {
			subheading = musicCarouselShelfBasicHeaderRenderer["strapline"]["runs"][0].text;
		}
		if (
			musicCarouselShelfBasicHeaderRenderer?.moreContentButton?.buttonRenderer?.navigationEndpoint?.browseEndpoint
				?.browseId
		) {
			browseId =
				musicCarouselShelfBasicHeaderRenderer?.moreContentButton?.buttonRenderer?.navigationEndpoint?.browseEndpoint
					?.browseId;
		}
		return {
			title: musicCarouselShelfBasicHeaderRenderer["title"]["runs"][0].text,
			subheading,
			browseId,
		};
	}
}

function parseBody(contents = []):
	| ICarouselTwoRowItem[]
	| IListItemRenderer[]
	| {
			text: any;
			color: string;
			endpoint: {
				params: any;
				browseId: any;
			};
	  }[] {
	let items = [];
	for (let index = 0; index < contents.length; index++) {
		const element = contents[index];
		if (element.musicTwoRowItemRenderer) {
			items = [...items, MusicTwoRowItemRenderer(element)];
		}
		if (element.musicResponsiveListItemRenderer) {
			items = [...items, MusicResponsiveListItemRenderer(element)];
		}
		if (element.musicNavigationButtonRenderer) {
			items = [...items, MoodsAndGenresItem(element)];
		}
	}
	return items;
}

function parseCarousel(carousel: {
	musicImmersiveCarouselShelfRenderer?: Record<string, any>;
	musicCarouselShelfRenderer?: Record<string, any>;
}) {
	return {
		header: parseHeader(
			carousel.musicCarouselShelfRenderer?.header ?? carousel.musicImmersiveCarouselShelfRenderer?.header,
		),
		type: "carousel",
		results: parseBody(
			carousel.musicCarouselShelfRenderer?.contents ?? carousel.musicImmersiveCarouselShelfRenderer?.contents,
		),
	};
}
