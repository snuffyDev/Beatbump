/* eslint-disable @typescript-eslint/no-explicit-any */
import { MoodsAndGenresItem } from "$lib/parsers";
import type { ItemBuilder } from "$lib/parsers/items";
import type { CarouselHeader } from "$lib/types";
import type {
	IMusicResponsiveListItemRenderer,
	IMusicTwoRowItemRenderer,
} from "$lib/types/innertube/internals";
import type { MusicCarouselShelfBasicHeaderRenderer } from "$lib/types/innertube/musicCarouselShelfRenderer";
import type { ICarouselTwoRowItem } from "$lib/types/musicCarouselTwoRowItem";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import type { ParsedCarousel } from "../../../../routes/(app)/api/_lib/models/Carousel";
import type { GridOrCarousel } from "../parseSectionObject";

function parseHeader(header: {
	musicCarouselShelfBasicHeaderRenderer: MusicCarouselShelfBasicHeaderRenderer;
}): CarouselHeader {
	if (typeof header !== "object") return { title: "" };
	const { musicCarouselShelfBasicHeaderRenderer } = header;
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
	return undefined as never;
}

async function parseBody(
	contents:
		| { musicTwoRowItemRenderer: IMusicTwoRowItemRenderer }[]
		| { musicResponsiveListItemRenderer: IMusicResponsiveListItemRenderer }[]
		| any[] = [],
	itemBuilder: ItemBuilder,
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
					return itemBuilder.MusicTwoRowItemRenderer(
						item as { musicTwoRowItemRenderer: IMusicTwoRowItemRenderer },
					);
				}
				if ("musicResponsiveListItemRenderer" in item) {
					return itemBuilder.MusicResponsiveListItemRenderer(
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
export async function parseCarousel(
	data: {
		musicImmersiveCarouselShelfRenderer?: GridOrCarousel<"carousel">["musicCarouselShelfRenderer"];
		musicCarouselShelfRenderer?: GridOrCarousel<"carousel">["musicCarouselShelfRenderer"];
	},
	itemBuilder: ItemBuilder,
): Promise<ParsedCarousel<"twoRowItem">> {
	const carousel =
		data?.musicCarouselShelfRenderer ??
		data?.musicImmersiveCarouselShelfRenderer;
	const header = parseHeader(carousel?.header as never);
	const items = await parseBody(carousel?.contents, itemBuilder);
	return { header, items, type: "carousel" };
}
