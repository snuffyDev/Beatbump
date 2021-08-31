import { MusicResponsiveListItemRenderer } from '$lib/parsers'

/* eslint-disable no-prototype-builtins */
export function parsePageContents(data) {
	// eslint-disable-next-line prefer-const
	const {
		header = {},
		contents: {
			singleColumnBrowseResultsRenderer: {
				tabs: [
					{
						tabRenderer: {
							content: {
								sectionListRenderer: {
									contents: [
										{ musicShelfRenderer: { contents = [] } = {} }
									] = []
								} = {}
							} = {}
						} = {}
					}
				] = []
			} = {}
		} = {}
	} = data
	let items = []
	// console.log(contents)
	let t = {
		items: 'item'
	}

	const songs = contents.map(
		({ musicResponsiveListItemRenderer = {} }, index) => {
			const {
				text,
				navigationEndpoint: {
					watchEndpoint: { playlistId = '', videoId = '' } = {}
				} = {}
			} = musicResponsiveListItemRenderer.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs[0]
			const playlistSetVideoId =
				musicResponsiveListItemRenderer.playlistItemData.playlistSetVideoId
			let explicit = false
			if (musicResponsiveListItemRenderer?.badges) {
				explicit = true
			}
			const length =
				musicResponsiveListItemRenderer.fixedColumns[0]
					.musicResponsiveListItemFixedColumnRenderer.text.runs[0].text
			return {
				title: text,
				playlistId,
				videoId,
				index,
				length,
				explicit
			}
		}
	)

	const releaseInfo = [header].map(({ musicDetailHeaderRenderer = {} }) => ({
		playlistId:
			musicDetailHeaderRenderer.menu.menuRenderer.topLevelButtons[0]
				.buttonRenderer.navigationEndpoint.watchPlaylistEndpoint.playlistId,
		subtitles: [
			{
				year: musicDetailHeaderRenderer.subtitle.runs[4].text,
				tracks: musicDetailHeaderRenderer.secondSubtitle.runs[0].text,
				length: musicDetailHeaderRenderer.secondSubtitle.runs[2].text,
				contentRating: musicDetailHeaderRenderer.hasOwnProperty(
					'subtitleBadges'
				)
					? true
					: false
			}
		],
		secondSubtitle: [],
		artist: {
			name: musicDetailHeaderRenderer.subtitle.runs[2].text,
			channelId:
				musicDetailHeaderRenderer.subtitle.runs[2].navigationEndpoint
					.browseEndpoint.browseId
		},
		thumbnails:
			musicDetailHeaderRenderer.thumbnail.croppedSquareThumbnailRenderer
				.thumbnail.thumbnails,
		title: musicDetailHeaderRenderer.title.runs[0].text,
		autoMixId:
			musicDetailHeaderRenderer.menu.menuRenderer.items[1]
				.menuNavigationItemRenderer.navigationEndpoint.watchPlaylistEndpoint
				.playlistId
	}))

	// console.log(items)

	return {
		items: songs,
		releaseInfo: releaseInfo[0]
	}
}
