import type { NavigationEndpoint, Thumbnail } from "$lib/types";
import type {
	MusicResponsiveListItemRendererItem,
	SubtitleRun,
} from "$lib/types/innertube/internals";
import type { ButtonRenderer } from "$lib/types/innertube/musicCarouselShelfRenderer";
import type { ItemBuilder } from "./items";
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
			topLevelButtons: {
				buttonRenderer: ButtonRenderer & {
					navigationEndpoint: NavigationEndpoint;
				};
			}[];
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
export async function parsePageContents(data: Data, itemBuilder: ItemBuilder) {
	const contents =
		data.contents?.singleColumnBrowseResultsRenderer?.tabs[0].tabRenderer
			.content.sectionListRenderer.contents[0].musicShelfRenderer.contents ||
		[];

	const songs = await Promise.all(
		contents.map(
			async (
				{
					musicResponsiveListItemRenderer,
				}: MusicResponsiveListItemRendererItem,
				index: number,
			) => ({
				...(await itemBuilder.MusicResponsiveListItemRenderer({
					musicResponsiveListItemRenderer,
				})),
				index,
			}),
		),
	);

	const releaseInfoParser = () => {
		// console.log(data.header.musicDetailHeaderRenderer.subtitle.runs);
		const year = data.header?.musicDetailHeaderRenderer?.subtitle?.runs.at(-1);
		const length = data.header?.musicDetailHeaderRenderer?.subtitle?.runs[0];
		const artists = (
			data.header?.musicDetailHeaderRenderer?.subtitle?.runs as SubtitleRun[]
		).map((item) => ({
			name: item.text,
			...(!!item?.navigationEndpoint?.browseEndpoint?.browseId && {
				channelId: item?.navigationEndpoint?.browseEndpoint?.browseId || "",
			}),
		}));
		return {
			playlistId:
				data.header?.musicDetailHeaderRenderer?.menu?.menuRenderer
					?.topLevelButtons[0]?.buttonRenderer?.navigationEndpoint
					?.watchEndpoint?.playlistId,
			subtitles: [
				{
					year: year.text,
					tracks:
						data.header?.musicDetailHeaderRenderer?.secondSubtitle?.runs[0]
							.text,
					length:
						data.header?.musicDetailHeaderRenderer?.secondSubtitle?.runs[2]
							?.text,
					type: length.text,
					contentRating: data.header?.musicDetailHeaderRenderer?.hasOwnProperty(
						"subtitleBadges",
					)
						? true
						: false,
				},
			],
			secondSubtitle: [],
			artist: artists,
			thumbnails: (
				data.header?.musicDetailHeaderRenderer?.thumbnail
					?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails as Thumbnail[]
			)?.map((thumbnail) => itemBuilder.handleGenericThumbnailItem(thumbnail)),
			title: data.header?.musicDetailHeaderRenderer.title?.runs[0].text,
			autoMixId:
				data.header?.musicDetailHeaderRenderer.menu?.menuRenderer?.items[1]
					?.menuNavigationItemRenderer?.navigationEndpoint
					?.watchPlaylistEndpoint?.playlistId || null,

			explicit:
				data?.header?.musicDetailHeaderRenderer?.subtitleBadges?.[0]?.icon?.includes?.(
					"EXPLICIT",
				),
		};
	};
	const releaseInfo = releaseInfoParser();
	// console.log(releaseInfo)

	return {
		items: songs,
		contents,
		releaseInfo: releaseInfo,
	};
}
