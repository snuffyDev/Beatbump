import {
	MusicResponsiveListItemRenderer,
	MusicTwoRowItemRenderer
} from "$lib/parsers";
import type { CarouselHeader, ICarousel, Item, Thumbnail } from "$lib/types";
import type { IMusicResponsiveListItemRenderer } from "$lib/types/internals";

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
}

export function ArtistPageParser({
	header = {},
	items = []
}: {
	header?: {
		musicImmersiveHeaderRenderer?: any;
		musicVisualHeaderRenderer?: any;
	};
	items?: any[];
}): ArtistPage {
	header = header?.musicImmersiveHeaderRenderer
		? header?.musicImmersiveHeaderRenderer
		: header?.musicVisualHeaderRenderer;
	let len = items.length;
	let songs = {};
	const carousels = [];

	for (; len--; ) {
		if (items[len]["musicShelfRenderer"]) {
			songs = {
				items: parseSongs(items[len]["musicShelfRenderer"]["contents"]),
				header: items[len]["musicCarouselShelfRenderer"]
					? {
							...items[len]["musicCarouselShelfRenderer"]["bottomEndpoint"][
								"browseEndpoint"
							]
					  }
					: undefined
			};
		}
		if (items[len]["musicCarouselShelfRenderer"]) {
			carousels[len - 1] = parseCarousel(
				items[len]["musicCarouselShelfRenderer"]["contents"],
				items[len]["musicCarouselShelfRenderer"]["header"][
					"musicCarouselShelfBasicHeaderRenderer"
				]
			);
		}
	}

	return {
		header: parseArtistHeader(header),
		body: {
			carousels,
			songs
		}
	};
}

function parseSongs(items = []) {
	let len = items.length;

	for (; len--; ) {
		items[len] = MusicResponsiveListItemRenderer(items[len]);
	}

	return items;
}

function parseCarousel(items = [], _header) {
	let len = items.length;
	const contents = [];

	for (; len--; ) {
		contents.push(MusicTwoRowItemRenderer(items[len]));
	}

	const header = {
		title: _header["title"]["runs"][0]["text"],
		endpoint: _header["title"]["runs"][0]["navigationEndpoint"] ?? undefined,
		itct:
			(_header["moreContentButton"] &&
				encodeURIComponent(
					_header.moreContentButton?.buttonRenderer?.navigationEndpoint
						?.clickTrackingParams
				)) ??
			undefined,
		browseId: _header["moreContentButton"]
			? _header["moreContentButton"]["buttonRenderer"]["navigationEndpoint"][
					"browseEndpoint"
			  ]["browseId"]
			: undefined,
		params: _header["moreContentButton"]
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
			radio: header["startRadioButton"]["buttonRenderer"]["navigationEndpoint"][
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
			shuffle: header["playButton"]["buttonRenderer"]["navigationEndpoint"] && {
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
