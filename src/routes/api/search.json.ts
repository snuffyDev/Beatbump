/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import BaseContext from '$lib/context'
import type { Artist, NextContinuationData, Song } from '$lib/types'
import type { PlaylistSearch } from '$lib/types/playlist'
import { pb } from '$lib/utils'
import type { EndpointOutput } from '@sveltejs/kit'
interface SearchOutput extends EndpointOutput {
	contents?: Song | PlaylistSearch
	didYouMean?: { term: string; endpoint: { query; params } }
	continuation?: NextContinuationData
}
export async function get({ query }) {
	let q = query.get('q')
	const filter = query.get('filter') || ''
	const videoId = query.get('videoId') || ''
	const itct = query.get('itct') || ''
	const playlistId = query.get('playlistId') || ''
	const ctoken = query.get('ctoken') || ''
	const browseId = query.get('browseId') || ''
	console.log(q)
	const pageType = query.get('pt') || ''

	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/search?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30${
			ctoken !== '' ? '' : `&sp=EgWKAQIIAWoKEAMQBBAKEAkQBQ%3D%3D`
		}${
			ctoken !== ''
				? `&ctoken=${ctoken}&continuation=${ctoken}&itct=${itct}&type='next'`
				: ''
		}`,
		{
			method: 'POST',
			body: JSON.stringify({
				...BaseContext,
				user: {
					enableSafetyMode: false
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
	// return { status: 200, body: await response.json() }
	if (!response.ok) {
		// NOT res.status >= 200 && res.status < 300
		return { status: response.status, body: response.statusText }
	}
	const data = await response.json()
	let {
		continuationContents,
		contents: {
			tabbedSearchResultsRenderer: {
				tabs: [
					{
						tabRenderer: {
							content: {
								sectionListRenderer: {
									contents: [
										{
											// didYouMeanRenderer = {},
											// messageRenderer: {
											// 	text: { runs: [{ text: string }] = {} } = {}
											// } = {},
											musicShelfRenderer
										} = {}
									] = [],
									contents = []
								} = {}
							} = {}
						} = {}
					} = {}
				] = []
			} = {}
		} = {}
	} = await data
	if (Object.prototype.hasOwnProperty.call(data, 'continuationContents')) {
		const results = parseSearchResult(continuationContents, true, filter)

		return {
			status: 200,
			body: JSON.stringify(results)
		}
	} else {

		const results = parseSearchResult(contents, false, filter)

		return {
			status: 200,
			body: JSON.stringify(results)
		}
	}
}
// Parse the playlist results for search.
const parsePlaylist = (contents): PlaylistSearch[] => {
	return contents.map(({ musicResponsiveListItemRenderer }) => {
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

		return {
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
			type: 'playlist'
		}
	})
}

const parseSong = (contents, type): Song[] => {
	return contents.map(({ musicResponsiveListItemRenderer }, i) => {
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
		const title =
			musicResponsiveListItemRenderer.flexColumns[0]
				.musicResponsiveListItemFlexColumnRenderer.text.runs[0].text
		// console.log(title)

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
		let albumInfo
		if (type == 'song') {
			const albumArr: [] = flexColumns[1].text.runs
			const album: {
				text
				navigationEndpoint: { browseEndpoint: { browseId } }
			}[] = albumArr.slice(2, 3)

			albumInfo = {
				browseId: album[0]?.navigationEndpoint?.browseEndpoint?.browseId,
				title: album[0]?.text
			}
		} else {
			albumInfo = null
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
		return {
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
	})
}

function parseSearchResult(data, cont, filter?) {
	/*
        data = response data
        cont = continuation
				*/
	console.log(data)
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
		if (data[0]?.messageRenderer) return []
		if (data[0]?.itemSectionRenderer) {
			if (data[0]?.itemSectionRenderer?.contents[0].messageRenderer)
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
	if (ctx?.itemSectionRenderer) return []

	let results: Song[] | PlaylistSearch[] = []

	ctx.map((c) => {
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
		filter = decodeURIComponent(filter)
		const paramList = [
			'EgWKAQIoAWoKEAMQBBAKEAUQCQ==',
			'EgeKAQQoADgBagwQDhAKEAkQAxAEEAU=',
			'EgeKAQQoAEABagwQDhAKEAkQAxAEEAU='
		]
		const videoParams = 'EgWKAQIQAWoKEAMQBBAKEAUQCQ=='

		if (!paramList.includes(filter) && !videoParams.includes(filter)) {
			const { contents: ctx } = contents[0]
			continuation = continuationCheck(contents[0])

			// console.log(contents)
			results = parseSong(ctx, 'song')
			return { results, continuation }
		} else if (videoParams == filter) {
			continuation = continuationCheck(contents[0])

			const { contents: ctx } = contents[0]
			results = parseSong(ctx, 'video')
			return { results, continuation }
		} else {
			continuation = continuationCheck(contents[0])
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
function continuationCheck(contents) {
	if (!Object.prototype.hasOwnProperty.call(contents, 'continuations')) {
		return
	}
	return { ...contents?.continuations[0].nextContinuationData }
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
