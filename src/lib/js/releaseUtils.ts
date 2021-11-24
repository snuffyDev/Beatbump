import { MusicResponsiveListItemRenderer } from '$lib/parsers'
type Data = {
	header: {
		musicDetailHeaderRenderer: {
			title
			subtitle: {
				runs: [
					{
						text: string
						navigationEndpoint: { browseEndpoint: { browseId: string } }
					}
				]
			}
			menu
			thumbnail
			moreButton
			subtitleBadges
			secondSubtitle: { runs: [{ text: string }] }
		}
	}
	contents: {
		singleColumnBrowseResultsRenderer: {
			tabs: [
				{
					tabRenderer: {
						content: {
							sectionListRenderer: {
								contents: [{ musicShelfRenderer: { contents } }]
							}
						}
					}
				}
			]
		}
	}
}
/* eslint-disable no-prototype-builtins */
export function parsePageContents(data: Data) {
	let items = []
	// console.log(contents)
	let t = {
		items: 'item'
	}
	const contents = [
		...data.contents?.singleColumnBrowseResultsRenderer?.tabs[0].tabRenderer
			.content.sectionListRenderer.contents[0].musicShelfRenderer.contents
	]
	const songs = contents.map(
		({ musicResponsiveListItemRenderer = {} }, index) => {
			const {
				text,
				navigationEndpoint: {
					watchEndpoint: { playlistId = '', videoId = '' } = {}
				} = {}
			} = musicResponsiveListItemRenderer?.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs[0]
			const playlistSetVideoId =
				musicResponsiveListItemRenderer?.playlistItemData?.playlistSetVideoId
			let explicit = false
			if (musicResponsiveListItemRenderer?.badges) {
				explicit = true
			}
			console.log(contents)
			const length = musicResponsiveListItemRenderer.fixedColumns
				? musicResponsiveListItemRenderer?.fixedColumns[0]
						?.musicResponsiveListItemFixedColumnRenderer?.text?.runs[0]?.text
				: ''
			return {
				title: text,
				playlistId,
				videoId,
				musicResponsiveListItemRenderer,
				index,
				length,
				explicit
			}
		}
	)

	const releaseInfoParser = () => {
		const year = data.header?.musicDetailHeaderRenderer.subtitle?.runs.pop()
		const length = data.header?.musicDetailHeaderRenderer.subtitle?.runs.shift()
		const artists = [
			...data.header?.musicDetailHeaderRenderer.subtitle?.runs
				.filter((item) => !item.text.includes('•'))
				.map((item) => ({
					name: item.text,
					channelId: item?.navigationEndpoint?.browseEndpoint?.browseId || ''
				}))
		]
		return {
			playlistId:
				data.header?.musicDetailHeaderRenderer.menu?.menuRenderer
					?.topLevelButtons[0].buttonRenderer.navigationEndpoint
					.watchPlaylistEndpoint.playlistId,
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
						'subtitleBadges'
					)
						? true
						: false
				}
			],
			secondSubtitle: [],
			artist: artists,
			thumbnails:
				data.header?.musicDetailHeaderRenderer?.thumbnail
					?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails,
			title: data.header?.musicDetailHeaderRenderer.title?.runs[0].text,
			autoMixId:
				data.header?.musicDetailHeaderRenderer.menu?.menuRenderer?.items[1]
					?.menuNavigationItemRenderer?.navigationEndpoint
					?.watchPlaylistEndpoint?.playlistId || null
		}
	}
	const releaseInfo = releaseInfoParser()
	console.log(releaseInfo)

	return {
		items: songs,
		releaseInfo: releaseInfo
	}
}
