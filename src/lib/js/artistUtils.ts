import { pb } from "$lib/utils";

export const parseArtistPage = (header, items) => {
	console.log(items);
	header = [header];
	let parsedHeader = header.map((h) => {
		let name = h.title.runs[0].text;
		let description;
		let thumbnail = h.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails;
		let mixInfo =
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
	let temp = [];
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
	let results = [];
	items.map(({ musicResponsiveListItemRenderer }) => {
		let d = musicResponsiveListItemRenderer;
		let explicit;
		if (d.hasOwnProperty("badges")) explicit = true;
		const flexColumns = pb(
			d,
			"musicResponsiveListItemFlexColumnRenderer",
			true
		);

		let thumbnails = d.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails;
		let title = pb(flexColumns[0], "runs:text", true);
		let browse;
		let browseId;
		if (
			d.menu.menuRenderer.items[5].menuNavigationItemRenderer.navigationEndpoint
				.browseEndpoint
		) {
			let menu = pb(d.menu.menuRenderer, "items", true);
			let items = pb(
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
				d.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs[0]
					.navigationEndpoint.browseEndpoint.browseId;
		}
		let mixInfo =
			d.menu.menuRenderer.items[0].menuNavigationItemRenderer
				.navigationEndpoint;
		let { videoId, playlistId, params } = mixInfo.watchEndpoint;
		let metaInfo: any[] = pb(flexColumns[1], "runs:text");

		let artist;
		let length = metaInfo[metaInfo.length - 1];
		if (metaInfo.length > 1) {
			metaInfo = [...metaInfo];
			artist = metaInfo.join("");
		}
		let artistInfo = {
			browseId: browseId,
			artists: [artist],
		};
		// console.log(artists, artists)
		let result = {
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
	let contents = items.map(({ musicTwoRowItemRenderer }) => {
		let ctx = musicTwoRowItemRenderer;
		let explicit;
		let thumbnails =
			ctx.thumbnailRenderer.musicThumbnailRenderer.thumbnail.thumbnails;
		if (ctx.subtitleBadges) {
			explicit = true;
		}
		let title = ctx.title.runs[0].text;
		let browseEndpoint = ctx.title?.runs[0]?.navigationEndpoint?.browseEndpoint;
		return { browseEndpoint, title, thumbnails, explicit };
	});
	let head = [
		...header.map((i) => {
			let title = i.text;
			let endpoint = i.navigationEndpoint?.browseEndpoint;
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
