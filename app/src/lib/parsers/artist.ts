/* eslint-disable @typescript-eslint/no-explicit-any */
import { MusicResponsiveListItemRenderer } from "$lib/parsers/items/musicResponsiveListItemRenderer";
import { MusicTwoRowItemRenderer } from "$lib/parsers/items/musicTwoRowItemRenderer";
import type { CarouselHeader, Thumbnail } from "$lib/types";
import type { MusicResponsiveListItemRendererItem } from "$lib/types/innertube/internals";
import type { ICarouselTwoRowItem } from "$lib/types/musicCarouselTwoRowItem";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";

export interface IArtistPageHeader {
	name: string;
	thumbnails: Thumbnail[];
	buttons: {
		shuffle?: { params?: string; playlistId?: string; videoId?: string };
		radio?: {
			params?: string;
			playlistId?: string;
		} | null;
	};
	mixInfo?: {
		params?: string;
		playlistId?: string;
	};
	description?: string;
	foregroundThumbnails?: Thumbnail[];
}

export interface ArtistPageBody {
	carousels?: { header: CarouselHeader; contents: ICarouselTwoRowItem[] }[];
	songs?: {
		header?: CarouselHeader;
		items?: IListItemRenderer[];
	};
}
export interface ArtistPage {
	header?: IArtistPageHeader;
	body?: ArtistPageBody;
	visitorData?: string;
}

export async function ArtistPageParser({
	header = {},
	items = [],
	visitorData = "",
}: {
	header?: {
		musicImmersiveHeaderRenderer?: any;
		musicVisualHeaderRenderer?: any;
	};
	items?: any[];
	visitorData?: string;
}): Promise<ArtistPage> {
	header =
		"musicImmersiveHeaderRenderer" in header
			? header.musicImmersiveHeaderRenderer
			: header?.musicVisualHeaderRenderer;

	const songs: {
		items?: IListItemRenderer[];
		header?: Record<string, unknown>;
	} = {};
	const carousels: ArtistPageBody["carousels"] = [];

	for (const item of items) {
		if (item["musicShelfRenderer"]) {
			const contents = await parseSongs(item["musicShelfRenderer"]["contents"]);
			songs.items = contents;
			songs.header = item["musicShelfRenderer"]
				? item.musicShelfRenderer?.bottomEndpoint?.browseEndpoint
				: undefined;
		}
		if (item["musicCarouselShelfRenderer"]) {
			const carousel = await parseCarousel(
				item["musicCarouselShelfRenderer"]["contents"],
				item["musicCarouselShelfRenderer"]["header"][
					"musicCarouselShelfBasicHeaderRenderer"
				],
			);
			carousels.push(carousel);
		}
	}
	const artistHeader = parseArtistHeader(header);
	return {
		header: artistHeader,
		body: {
			carousels: await Promise.all(carousels),
			songs,
		},
		visitorData,
	};
}

function parseSongs(items: unknown[] = []) {
	return Promise.all(
		items.map(async (item) => {
			return await MusicResponsiveListItemRenderer(
				item as MusicResponsiveListItemRendererItem,
			);
		}),
	);
}

async function parseCarousel(items = [], _header: { [index: string]: any }) {
	let hasButtonRenderer = false;
	const contents: Promise<ICarouselTwoRowItem>[] = [];

	for (const item of items) {
		contents.push(MusicTwoRowItemRenderer(item));
	}

	if (
		_header["moreContentButton"] &&
		_header["moreContentButton"]["buttonRenderer"]
	) {
		hasButtonRenderer = true;
	}

	let title = _header["title"]["runs"][0];
	let button =
		hasButtonRenderer &&
		_header["moreContentButton"]["buttonRenderer"]["navigationEndpoint"][
			"browseEndpoint"
		];

	const header = {
		title: title["text"],
		endpoint: title["navigationEndpoint"] ?? undefined,
		itct:
			(hasButtonRenderer &&
				encodeURIComponent(
					_header?.moreContentButton?.buttonRenderer?.trackingParams,
				)) ||
			undefined,
		browseId: hasButtonRenderer ? button["browseId"] : undefined,
		params: hasButtonRenderer ? button["params"] : undefined,
		type: title["text"],
	};

	(title = null), (button = null);

	return {
		header,
		contents: await Promise.all(contents),
	};
}
// Main header parser
function parseArtistHeader(header: Record<string, any>): IArtistPageHeader {
	const hasPlayButton = header["playButton"] ? true : false,
		hasRadioButton = header["startRadioButton"] ? true : false;
	return {
		name: header["title"]["runs"][0]["text"] || null,
		description: header["description"]
			? header["description"]["runs"][0]["text"]
			: undefined,
		foregroundThumbnails: header["foregroundThumbnail"]
			? header["foregroundThumbnail"]["musicThumbnailRenderer"]["thumbnail"][
					"thumbnails"
			  ]
			: undefined,
		thumbnails: header["thumbnail"]
			? header["thumbnail"]["musicThumbnailRenderer"]["thumbnail"]["thumbnails"]
			: [],
		buttons: {
			radio: hasRadioButton
				? {
						params: header["startRadioButton"]["buttonRenderer"][
							"navigationEndpoint"
						]["watchPlaylistEndpoint"]
							? header["startRadioButton"]["buttonRenderer"][
									"navigationEndpoint"
							  ]["watchPlaylistEndpoint"]["params"]
							: header["startRadioButton"]["buttonRenderer"][
									"navigationEndpoint"
							  ]["watchEndpoint"]
							? header["startRadioButton"]["buttonRenderer"][
									"navigationEndpoint"
							  ]["watchEndpoint"]["params"]
							: undefined,
						playlistId: header["startRadioButton"]["buttonRenderer"][
							"navigationEndpoint"
						]["watchPlaylistEndpoint"]
							? header["startRadioButton"]["buttonRenderer"][
									"navigationEndpoint"
							  ]["watchPlaylistEndpoint"]["playlistId"]
							: header["startRadioButton"]["buttonRenderer"][
									"navigationEndpoint"
							  ]["watchEndpoint"]
							? header["startRadioButton"]["buttonRenderer"][
									"navigationEndpoint"
							  ]["watchEndpoint"]["playlistId"]
							: undefined,
				  }
				: null,
			shuffle: hasPlayButton &&
				header["playButton"]["buttonRenderer"]["navigationEndpoint"] && {
					params: header["playButton"]["buttonRenderer"]["navigationEndpoint"][
						"watchEndpoint"
					]
						? header["playButton"]["buttonRenderer"]["navigationEndpoint"][
								"watchEndpoint"
						  ]["params"]
						: header["playButton"]["buttonRenderer"]["navigationEndpoint"][
								"watchPlaylistEndpoint"
						  ]["params"] ?? undefined,
					playlistId: header["playButton"]["buttonRenderer"][
						"navigationEndpoint"
					]["watchEndpoint"]
						? header["playButton"]["buttonRenderer"]["navigationEndpoint"][
								"watchEndpoint"
						  ]["playlistId"]
						: header["playButton"]["buttonRenderer"]["navigationEndpoint"][
								"watchPlaylistEndpoint"
						  ]["playlistId"] ?? undefined,
					videoId: header["playButton"]["buttonRenderer"]["navigationEndpoint"][
						"watchEndpoint"
					]
						? header["playButton"]["buttonRenderer"]["navigationEndpoint"][
								"watchEndpoint"
						  ]["videoId"]
						: undefined,
				},
		},
	};
}
