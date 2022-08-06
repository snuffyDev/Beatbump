import { MusicResponsiveListItemRenderer } from "$lib/parsers/items/musicResponsiveListItemRenderer";
import { filter, filterMap, map } from "$lib/utils";
type Data = {
	header: {
		musicDetailHeaderRenderer: {
			title;
			subtitle: {
				runs: {
					text: string;
					navigationEndpoint: { browseEndpoint: { browseId: string } };
				}[];
			};
			menu;
			thumbnail;
			moreButton;
			subtitleBadges;
			secondSubtitle: { runs: { text: string }[] };
		};
	};
	contents: {
		singleColumnBrowseResultsRenderer: {
			tabs: [
				{
					tabRenderer: {
						content: {
							sectionListRenderer: {
								contents: [{ musicShelfRenderer: { contents } }];
							};
						};
					};
				},
			];
		};
	};
};
/* eslint-disable no-prototype-builtins */
export function parsePageContents(data: Data) {
	// console.log(contents)
	const contents = [
		...data.contents?.singleColumnBrowseResultsRenderer?.tabs[0].tabRenderer.content.sectionListRenderer.contents[0]
			.musicShelfRenderer.contents,
	];
	const songs = map(contents, ({ musicResponsiveListItemRenderer = {} }, index) => ({
		...MusicResponsiveListItemRenderer({ musicResponsiveListItemRenderer }),
		index,
	}));

	const releaseInfoParser = () => {
		const year = data.header?.musicDetailHeaderRenderer.subtitle?.runs.pop();
		const length = data.header?.musicDetailHeaderRenderer.subtitle?.runs.shift();
		const artists = filter(
			[...data.header?.musicDetailHeaderRenderer.subtitle?.runs],
			(item) => !item.text.match(/[\s]?•[\s]?/),
		).map((item) => ({
			name: item.text,
			channelId: item?.navigationEndpoint?.browseEndpoint?.browseId || "",
		}));
		return {
			playlistId:
				data.header?.musicDetailHeaderRenderer.menu?.menuRenderer?.topLevelButtons[0].buttonRenderer.navigationEndpoint
					.watchPlaylistEndpoint.playlistId,
			subtitles: [
				{
					year: year.text,
					tracks: data.header?.musicDetailHeaderRenderer?.secondSubtitle?.runs[0].text,
					length: data.header?.musicDetailHeaderRenderer?.secondSubtitle?.runs[2]?.text,
					type: length.text,
					contentRating: data.header?.musicDetailHeaderRenderer?.hasOwnProperty("subtitleBadges") ? true : false,
				},
			],
			secondSubtitle: [],
			artist: artists,
			thumbnails:
				data.header?.musicDetailHeaderRenderer?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails,
			title: data.header?.musicDetailHeaderRenderer.title?.runs[0].text,
			autoMixId:
				data.header?.musicDetailHeaderRenderer.menu?.menuRenderer?.items[1]?.menuNavigationItemRenderer
					?.navigationEndpoint?.watchPlaylistEndpoint?.playlistId || null,
		};
	};
	const releaseInfo = releaseInfoParser();
	// console.log(releaseInfo)

	return {
		items: songs,
		releaseInfo: releaseInfo,
	};
}
