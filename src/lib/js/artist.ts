import {
	MusicResponsiveListItemRenderer,
	MusicTwoRowItemRenderer
} from "$lib/parsers";
import type { CarouselHeader, ICarousel, Item, Thumbnail } from "$lib/types";
import type { IMusicResponsiveListItemRenderer } from "$lib/types/internals";
import { iter } from "$lib/utils/collections";

export interface IArtistPageHeader {
	name: string;
	thumbnails: Thumbnail[];
	buttons: {
		shuffle?: { params?: string; playlistId?: string; videoId?: string };
		radio?: {
			params?: string;
			playlistId?: string;
		};
	};
	mixInfo?: {
		params?: string;
		playlistId?: string;
	};
	description?: string;
	foregroundThumbnails?: Thumbnail[];
}

export interface ArtistPageBody {
	carousels?: { header: CarouselHeader; contents: Item[] }[];
	songs?: {
		header?: CarouselHeader;
		items?: IMusicResponsiveListItemRenderer[];
	};
}
export interface ArtistPage {
	header?: IArtistPageHeader;
	body?: ArtistPageBody;
	visitorData?: string;
}

export function ArtistPageParser({
	header = {},
	items = [],
	visitorData = ""
}: {
	header?: {
		musicImmersiveHeaderRenderer?: any;
		musicVisualHeaderRenderer?: any;
	};
	items?: any[];
	visitorData?: string;
}): ArtistPage {
	header = header?.musicImmersiveHeaderRenderer
		? header?.musicImmersiveHeaderRenderer
		: header?.musicVisualHeaderRenderer;

	let songs = {};
	const carousels = [];
	iter(items, (item, idx) => {
		if (item["musicShelfRenderer"]) {
			songs = {
				items: parseSongs(item["musicShelfRenderer"]["contents"]),
				header: item["musicShelfRenderer"]
					? item["musicShelfRenderer"]["bottomEndpoint"]["browseEndpoint"]
					: undefined
			};
		}
		if (item["musicCarouselShelfRenderer"]) {
			carousels[idx - 1] = parseCarousel(
				item["musicCarouselShelfRenderer"]["contents"],
				item["musicCarouselShelfRenderer"]["header"][
					"musicCarouselShelfBasicHeaderRenderer"
				]
			);
		}
	});

	return {
		header: parseArtistHeader(header),
		body: {
			carousels,
			songs
		},
		visitorData
	};
}

function parseSongs(items = []) {
	let len = items.length;

	// for (; len--; ) {}
	iter(items, (item, idx) => {
		items[idx] = MusicResponsiveListItemRenderer(item);
	});

	return items;
}

function parseCarousel(items = [], _header) {
	let len = items.length;
	let hasButtonRenderer = false;
	const contents = [];

	for (; len--; ) {
		contents.push(MusicTwoRowItemRenderer(items[len]));
	}
	if (
		_header["moreContentButton"] &&
		_header["moreContentButton"]["buttonRenderer"]
	) {
		hasButtonRenderer = true;
	}
	const header = {
		title: _header["title"]["runs"][0]["text"],
		endpoint: _header["title"]["runs"][0]["navigationEndpoint"] ?? undefined,
		itct:
			(hasButtonRenderer &&
				encodeURIComponent(
					_header?.moreContentButton?.buttonRenderer?.trackingParams
				)) ??
			undefined,
		browseId: hasButtonRenderer
			? _header["moreContentButton"]["buttonRenderer"]["navigationEndpoint"][
					"browseEndpoint"
			  ]["browseId"]
			: undefined,
		params: hasButtonRenderer
			? _header["moreContentButton"]["buttonRenderer"]["navigationEndpoint"][
					"browseEndpoint"
			  ]["params"]
			: undefined,
		type: _header["title"]["runs"][0]["text"],
		data: _header
	};
	// moreContentButton.buttonRenderer.trackingParams
	return {
		header,
		contents
	};
}
// Main header parser
function parseArtistHeader(header: any): IArtistPageHeader {
	let hasPlayButton = header["playButton"] ? true : false,
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
		thumbnails:
			header["thumbnail"]["musicThumbnailRenderer"]["thumbnail"][
				"thumbnails"
			] || [],
		buttons: {
			radio: hasRadioButton &&
				header["startRadioButton"]["buttonRenderer"]["navigationEndpoint"][
					"watchPlaylistEndpoint"
				] && {
					params:
						header["startRadioButton"]["buttonRenderer"]["navigationEndpoint"][
							"watchPlaylistEndpoint"
						]["params"] ?? undefined,
					playlistId:
						header["startRadioButton"]["buttonRenderer"]["navigationEndpoint"][
							"watchPlaylistEndpoint"
						]["playlistId"] ?? undefined
				},
			shuffle: hasPlayButton &&
				header["playButton"]["buttonRenderer"]["navigationEndpoint"] && {
					params:
						header["playButton"]["buttonRenderer"]["navigationEndpoint"][
							"watchEndpoint"
						]["params"] ?? undefined,
					playlistId:
						header["playButton"]["buttonRenderer"]["navigationEndpoint"][
							"watchEndpoint"
						]["playlistId"] ?? undefined,
					videoId:
						header["playButton"]["buttonRenderer"]["navigationEndpoint"][
							"watchEndpoint"
						]["videoId"] ?? undefined
				}
		}
	};
}
