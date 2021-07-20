import type { Artist, Song } from '$lib/types'
import type { PlaylistSearch } from '$lib/types/playlist'
import { pb } from '$lib/utils'
import type { EndpointOutput } from '@sveltejs/kit'
import type { DefaultBody } from '@sveltejs/kit/types/endpoint'

export async function get({ query }): Promise<EndpointOutput<DefaultBody>> {
	const q = query.get('q') || ''
	const filter = query.get('filter') || ''
	const videoId = query.get('videoId') || ''
	const itct = query.get('itct') || ''
	const playlistId = query.get('playlistId') || ''
	const ctoken = query.get('ctoken') || ''
	const browseId = query.get('browseId') || ''
	// console.log(endpoint)
	const pageType = query.get('pt') || ''

	try {
		const response = await fetch(
			`https://music.youtube.com/youtubei/v1/search?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30${
				ctoken !== '' ? '' : `&sp=EgWKAQIIAWoKEAoQAxAEEAUQCQ%3D%3D`
			}${
				ctoken !== ''
					? `&ctoken=${ctoken}&continuation=${ctoken}&itct=${itct}&type='next'`
					: ''
			}`,
			{
				method: 'POST',
				body: JSON.stringify({
					context: {
						client: {
							clientName: 'WEB_REMIX',
							clientVersion: '0.1',
							deviceMake: 'google',
							platform: 'DESKTOP',
							deviceModel: 'bot',
							experimentIds: [],
							experimentsToken: '',
							osName: 'Googlebot',
							osVersion: '2.1',
							locationInfo: {
								locationPermissionAuthorizationStatus:
									'LOCATION_PERMISSION_AUTHORIZATION_STATUS_UNSUPPORTED'
							},
							musicAppInfo: {
								musicActivityMasterSwitch:
									'MUSIC_ACTIVITY_MASTER_SWITCH_INDETERMINATE',
								musicLocationMasterSwitch:
									'MUSIC_LOCATION_MASTER_SWITCH_INDETERMINATE',
								pwaInstallabilityStatus: 'PWA_INSTALLABILITY_STATUS_UNKNOWN'
							},
							utcOffsetMinutes: -new Date().getTimezoneOffset()
						},
						capabilities: {},
						request: {
							internalExperimentFlags: [
								{
									key: 'force_music_enable_outertube_tastebuilder_browse',
									value: 'true'
								},
								{
									key: 'force_music_enable_outertube_playlist_detail_browse',
									value: 'true'
								},
								{
									key: 'force_music_enable_outertube_search_suggestions',
									value: 'true'
								}
							],
							sessionIndex: {}
						},
						user: {
							enableSafetyMode: false
						},
						activePlayers: {}
					},
					browseEndpointContextMusicConfig: {
						browseEndpointContextMusicConfig: {
							pageType: `${pageType}`
						}
					},
					browseId: `${browseId}`,

					isAudioOnly: true,
					query: `${q}`,

					params: `${filter}`,
					videoId: `${videoId}`,
					playlistId: `${playlistId}`
				}),
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					Origin: 'https://music.youtube.com',
					'User-Agent':
						'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
				}
			}
		)

		if (!response.ok) {
			// NOT res.status >= 200 && res.status < 300
			return { status: response.status, body: response.statusText }
		}
		const data = await response.json()

		if (Object.prototype.hasOwnProperty.call(data, 'continuationContents')) {
			const { continuationContents } = data
			const results = parseSearchResult(continuationContents, true, filter)

			// console.log(`contents: `, results);
			return {
				status: 200,
				body: JSON.stringify(results)
			}
		} else {
			const {
				contents: {
					sectionListRenderer: { contents: [...rest] = [] }
				}
			} = await data

			const results = parseSearchResult(rest, false, filter)

			return {
				status: 200,
				body: JSON.stringify(results)
			}
		}
	} catch (error) {
		console.log(error)
		return {
			status: 400,
			body: error
		}
	}
}
// Parse the playlist results for search.
const parsePlaylist = (contents) => {
	const results: PlaylistSearch[] = []
	const type = 'playlist'
	contents.map(({ musicResponsiveListItemRenderer }) => {
		// const d = musicResponsiveListItemRenderer
		const thumbnails =
			musicResponsiveListItemRenderer.thumbnail.musicThumbnailRenderer.thumbnail
				.thumbnails
		const browseId =
			musicResponsiveListItemRenderer.navigationEndpoint.browseEndpoint.browseId
		const title =
			musicResponsiveListItemRenderer.flexColumns[0]
				.musicResponsiveListItemFlexColumnRenderer.text.runs[0].text
		const flexColumns = pb(
			musicResponsiveListItemRenderer,
			'musicResponsiveListItemFlexColumnRenderer',
			true
		)
		let metaData = pb(flexColumns[1], 'runs:text', true)
		metaData = metaData.join('')

		const result: PlaylistSearch = {
			thumbnails: thumbnails,
			browseId: browseId,
			metaData: metaData,
			playlistId:
				musicResponsiveListItemRenderer.menu?.menuRenderer?.items[0]
					?.menuNavigationItemRenderer?.navigationEndpoint
					?.watchPlaylistEndpoint?.playlistId,
			hash:
				Math.random().toString(36).substring(2, 15) +
				Math.random().toString(36).substring(2, 15),
			title: title,
			type: type
		}
		results.push(result)
	})
	return results
}

const parseSong = (contents) => {
	const type = 'song'
	const results: Song[] = []
	contents.map(({ musicResponsiveListItemRenderer }, i) => {
		// let d = musicResponsiveListItemRenderer
		let explicit
		if (
			Object.prototype.hasOwnProperty.call(
				musicResponsiveListItemRenderer,
				'badges'
			)
		)
			explicit = true
		const flexColumns = pb(
			musicResponsiveListItemRenderer,
			'musicResponsiveListItemFlexColumnRenderer',
			true
		)

		const thumbnails =
			musicResponsiveListItemRenderer.thumbnail.musicThumbnailRenderer.thumbnail
				.thumbnails
		const title = pb(flexColumns[0], 'runs:text', true)

		let browseId
		if (
			musicResponsiveListItemRenderer.menu?.menuRenderer?.items[5]
				?.menuNavigationItemRenderer?.navigationEndpoint?.browseEndpoint
		) {
			const menu = pb(
				musicResponsiveListItemRenderer.menu?.menuRenderer,
				'items',
				true
			)
			const items = pb(menu, 'menuNavigationItemRenderer')
			// console.log(items);
			if (items.length > 4) {
				browseId = items[3].navigationEndpoint.browseEndpoint.browseId
			} else {
				browseId = undefined
			}
		} else {
			browseId =
				musicResponsiveListItemRenderer.flexColumns[1]
					?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]
					?.navigationEndpoint?.browseEndpoint?.browseId
		}

		// const { videoId = '', playlistId, params }
		const videoId =
			musicResponsiveListItemRenderer.menu?.menuRenderer?.items[0]
				?.menuNavigationItemRenderer?.navigationEndpoint.watchEndpoint?.videoId
		const playlistId =
			musicResponsiveListItemRenderer.menu?.menuRenderer?.items[0]
				?.menuNavigationItemRenderer?.navigationEndpoint.watchEndpoint
				?.playlistId
		const params =
			musicResponsiveListItemRenderer.menu?.menuRenderer?.items[0]
				?.menuNavigationItemRenderer?.navigationEndpoint.watchEndpoint?.params

		const metaInfo = pb(flexColumns[1], 'runs:text', true)
		// console.log(metaInfo);
		const albumArr: [] = flexColumns[1].text.runs
		const album: {
			text
			navigationEndpoint: { browseEndpoint: { browseId } }
		}[] = albumArr.slice(2, 3)

		const albumInfo = {
			browseId: album[0]?.navigationEndpoint?.browseEndpoint?.browseId,
			title: album[0]?.text
		}

		// let album = {};
		const length = metaInfo[metaInfo.length - 1]

		const artistsArr = metaInfo.reverse()
		const artists = artistsArr.slice(4)
		if (artists.length > 1) {
			for (let i = 0; i < artists.length; i++) {
				artists.splice(i + 1, 1)
			}
		}
		artists.reverse()
		const artist: Artist = {
			browseId: browseId,
			artist: artists
		}
		// console.log(artists, artists)
		const result: Song = {
			album: albumInfo,
			artistInfo: artist,
			title: title,
			videoId: videoId,
			type: type,
			params: params,
			length: length,
			playlistId: playlistId,
			thumbnails: thumbnails,
			explicit: explicit,
			index: i++,
			hash:
				Math.random().toString(36).substring(2, 15) +
				Math.random().toString(36).substring(2, 15)
		}
		results.push(result)
	})
	return results
}

function parseSearchResult(data, cont, filter?) {
	/*
        data = response data
        cont = continuation
				*/

	let continuation

	let didYouMean
	let ctx

	if (cont) {
		// if has continuation, context = data
		ctx = [data]
	} else {
		/*  Error Handling
            Message Renderer is for when something goes horribly wrong,
            itemSectionRenderer is for when there's an error
        */
		if (data[0].messageRenderer) return []
		if (data[0].itemSectionRenderer) {
			if (data[0].itemSectionRenderer?.contents[0].messageRenderer)
				return { error: 'No Results Found' }
			didYouMean = correctedQuery(
				data[0]?.itemSectionRenderer?.contents[0].didYouMeanRenderer
			)

			ctx = [data[1]]
		} else {
			ctx = [data[0]]
		}
	}
	// Safety net
	if (ctx.itemSectionRenderer) return []

	let results: Song[] | PlaylistSearch[] = []

	ctx.map(async (c) => {
		let contents = []
		if (cont) {
			const { musicShelfContinuation } = c
			contents.push(musicShelfContinuation)
		} else {
			const { musicShelfRenderer } = c
			contents.push(musicShelfRenderer)
		}
		/* Search for if the request is for Playlists
           If not, then parse song request.
        */
		// filter = encodeURIComponent(filter);
		const paramList = [
			'EgWKAQIoAWoKEAMQBBAKEAUQCQ==',
			'EgeKAQQoADgBagwQDhAKEAkQAxAEEAU=',
			'EgeKAQQoAEABagwQDhAKEAkQAxAEEAU='
		]

		if (!paramList.includes(filter)) {
			if (contents[0]?.hasOwnProperty('continuations')) {
				continuation = contents[0].continuations[0].nextContinuationData
			}
			// console.log(contents)
			const { contents: ctx } = contents[0]
			results = parseSong(ctx)
			return { results, continuation }
		} else {
			if (contents[0]?.hasOwnProperty('continuations')) {
				continuation = contents[0]?.continuations[0].nextContinuationData
			}
			// console.log(contents)
			contents = contents[0]?.contents
			results = parsePlaylist(contents)
			return { results, continuation }
		}
	})

	if (didYouMean !== undefined) {
		return {
			contents: results,
			didYouMean: didYouMean,
			continuation: continuation
		}
	}
	return { contents: results, continuation: continuation }
}

/* Return the data for if there is a corrected query */
function correctedQuery(ctx) {
	const correctTerm = ctx?.correctedQuery?.runs[0].text
	const correctedEndpoint = ctx?.correctedQueryEndpoint?.searchEndpoint

	return {
		term: correctTerm,
		endpoint: correctedEndpoint
	}
}
