import type { ParsedCarousel } from "$api/models/Carousel";
import { MoodsAndGenresItem } from "$lib/parsers";
import {
	MusicTwoRowItemRenderer,
	MusicResponsiveListItemRenderer,
} from "$lib/parsers/items";
import type { CarouselHeader, MoodsAndGenresItem } from "$lib/types";
import type {
	IMusicTwoRowItemRenderer,
	IMusicResponsiveListItemRenderer,
} from "$lib/types/innertube/internals";
import type { ICarouselTwoRowItem } from "$lib/types/musicCarouselTwoRowItem";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import type { GridOrCarousel } from "../parseSectionObject";

function parseHeader({
	musicCarouselShelfBasicHeaderRenderer,
}): CarouselHeader {
	if (musicCarouselShelfBasicHeaderRenderer) {
		let subheading: any, browseId: any;
		if (musicCarouselShelfBasicHeaderRenderer?.strapline?.runs[0]?.text) {
			subheading =
				musicCarouselShelfBasicHeaderRenderer["strapline"]["runs"][0].text;
		}
		if (
			musicCarouselShelfBasicHeaderRenderer?.moreContentButton?.buttonRenderer
				?.navigationEndpoint?.browseEndpoint?.browseId
		) {
			browseId =
				musicCarouselShelfBasicHeaderRenderer?.moreContentButton?.buttonRenderer
					?.navigationEndpoint?.browseEndpoint?.browseId;
		}
		return {
			title: musicCarouselShelfBasicHeaderRenderer["title"]["runs"][0].text,
			subheading,
			browseId,
		};
	}
}

async function parseBody(
	contents:
		| { musicTwoRowItemRenderer: IMusicTwoRowItemRenderer }[]
		| { musicResponsiveListItemRenderer: IMusicResponsiveListItemRenderer }[]
		| any[] = [],
): Promise<ICarouselTwoRowItem[] | IListItemRenderer[] | []> {
	const items: any[] = await Promise.all(
		contents.map(
			(
				item:
					| {
							musicTwoRowItemRenderer?: IMusicTwoRowItemRenderer;
					  }
					| {
							musicResponsiveListItemRenderer?: IMusicResponsiveListItemRenderer;
					  },
			) => {
				if ("musicTwoRowItemRenderer" in item) {
					return MusicTwoRowItemRenderer(
						item as { musicTwoRowItemRenderer: IMusicTwoRowItemRenderer },
					);
				}
				if ("musicResponsiveListItemRenderer" in item) {
					return MusicResponsiveListItemRenderer(
						item as {
							musicResponsiveListItemRenderer: IMusicResponsiveListItemRenderer;
						},
					);
				}

				if ("musicNavigationButtonRenderer" in item) {
					return MoodsAndGenresItem(item);
				}
			},
		),
	);

	return items;
}
export async function parseCarouselItem(data: {
	musicImmersiveCarouselShelfRenderer?: GridOrCarousel<"carousel">["musicCarouselShelfRenderer"];
	musicCarouselShelfRenderer?: GridOrCarousel<"carousel">["musicCarouselShelfRenderer"];
}): Promise<ParsedCarousel<"twoRowItem">> {
	const carousel =
		data?.musicCarouselShelfRenderer ??
		data?.musicImmersiveCarouselShelfRenderer;
	const header = parseHeader(carousel?.header);
	const items = await parseBody(carousel?.contents);
	return { header, items, type: "carousel" };
}
