import type { Song, ArtistInfo } from "$lib/types";
import { pb } from "$lib/utils";

export const parseArtistPage = (header, items) => {
	console.log(items);
	header = [header];
	const parsedHeader = header.map((h) => {
		const name = h.title.runs[0].text;
		let description;
		const thumbnail = h.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails;
		const mixInfo =
			h.startRadioButton.buttonRenderer.navigationEndpoint
				.watchPlaylistEndpoint;
		if (h.description) {
			description = h.description.runs[0].text;
		} else {
			description = "";
		}
		return {
			name: name,
			thumbnails: thumbnail,
			mixInfo: mixInfo,
			description: description,
		};
	});
	let songs;
	let carouselItems = [];
	items.map((i) => {
		if (i.musicShelfRenderer) {
			songs = parseSongs(i.musicShelfRenderer.contents);
			console.log(songs);
		}
		if (i.musicCarouselShelfRenderer) {
			carouselItems = [
				...carouselItems,
				parseCarouselItem(
					i.musicCarouselShelfRenderer.contents,
					i.musicCarouselShelfRenderer.header
						.musicCarouselShelfBasicHeaderRenderer?.title.runs[0]
				),
			];
		}
	});
	console.log(`items`, carouselItems);
	return { ...parsedHeader, songs, carouselItems };
};

function parseSongs(items) {
	const results = [];
	let explicit;
	items.map(({ musicResponsiveListItemRenderer: d }) => {
		if (Object.prototype.hasOwnProperty.call(d, "badges")) explicit = true;
		const flexColumns = pb(
			d,
			"musicResponsiveListItemFlexColumnRenderer",
			true
		);

		const thumbnails = d.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails;
		const title = pb(flexColumns[0], "runs:text", true);
		// const browse
		let browseId;
		if (
			d.menu?.menuRenderer?.items[5]?.menuNavigationItemRenderer
				?.navigationEndpoint?.browseEndpoint
		) {
			const menu = pb(d.menu.menuRenderer, "items", true);
			const items = pb(
				menu,
				"menuNavigationItemRenderer:navigationEndpoint:browseEndpoint"
			);
			items.forEach((i) => {
				if (
					i.browseEndpointContextSupportedConfigs.browseEndpointContextMusicConfig.pageType.includes(
						"ARTIST"
					)
				) {
					browseId = i.browseId;
				}
			});
			// console.log(browse);
		} else {
			browseId =
				d.flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text
					?.runs[0]?.navigationEndpoint?.browseEndpoint?.browseId;
		}
		const mixInfo =
			d.menu.menuRenderer.items[0].menuNavigationItemRenderer
				.navigationEndpoint;
		const { videoId, playlistId, params } = mixInfo.watchEndpoint;
		let metaInfo: any[] = pb(flexColumns[1], "runs:text");

		let artist;
		const length = metaInfo[metaInfo.length - 1];
		if (metaInfo.length > 1) {
			metaInfo = [...metaInfo];
			artist = metaInfo.join("");
		}
		const artistInfo: ArtistInfo = {
			browseId: browseId,
			artists: [artist],
		};
		// console.log(artists, artists)
		const result: Song = {
			artistInfo: artistInfo,
			title: title,
			videoId: videoId,
			params: params,
			// length: length,
			playlistId: playlistId,
			thumbnails: thumbnails,
			explicit: explicit,
			hash:
				Math.random().toString(36).substring(2, 15) +
				Math.random().toString(36).substring(2, 15),
		};
		results.push(result);
	});
	return results;
}

function parseCarouselItem(items, header) {
	console.log(items, header);
	header = [header];
	const contents = items.map(({ musicTwoRowItemRenderer }) => {
		const ctx = musicTwoRowItemRenderer;
		let explicit;
		const thumbnails =
			ctx.thumbnailRenderer.musicThumbnailRenderer.thumbnail.thumbnails;
		if (ctx.subtitleBadges) {
			explicit = true;
		}
		let playlistId = "";
		const title = ctx.title.runs[0].text;
		let videoId = "";
		if (
			ctx?.menu?.menuRenderer?.items[2]?.menuServiceItemRenderer
				?.serviceEndpoint?.queueAddEndpoint?.queueTarget?.playlistId
		) {
			videoId =
				ctx?.thumbnailOverlay?.musicItemThumbnailOverlayRenderer?.content
					?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint
					?.videoId;
			playlistId =
				ctx?.menu?.menuRenderer?.items[2]?.menuServiceItemRenderer
					?.serviceEndpoint?.queueAddEndpoint?.queueTarget?.playlistId;
		}
		const browseEndpoint =
			ctx.title?.runs[0]?.navigationEndpoint?.browseEndpoint;
		if (playlistId !== undefined || playlistId !== null) {
			return {
				playlistId,
				videoId,
				browseEndpoint,
				title,
				thumbnails,
				explicit,
			};
		} else {
			return { browseEndpoint, title, thumbnails, explicit };
		}
	});
	const head = [
		...header.map((i) => {
			const title = i.text;
			const endpoint = i.navigationEndpoint?.browseEndpoint;
			if (endpoint) {
				return {
					title,

					browseId: endpoint.browseId,
					params: endpoint.params,
				};
			} else {
				return title;
			}
		}),
	];
	return { header: head, contents };
}
