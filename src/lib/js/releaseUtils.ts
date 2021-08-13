/* eslint-disable no-prototype-builtins */
export function parsePageContents(data) {
	// eslint-disable-next-line prefer-const
	let info = {}
	let playlistId
	console.log(data)
	let items = []
	const {
		frameworkUpdates: {
			entityBatchUpdate: { mutations }
		}
	} = data
	const arr = mutations
	arr.forEach((d) => {
		if (d.payload.hasOwnProperty('musicTrack')) {
			items.push(d.payload.musicTrack)
		}
		if (d.payload.hasOwnProperty('musicAlbumRelease')) {
			Object.assign(info, d.payload.musicAlbumRelease)

			// console.log(info)
		}
		if (d.payload.hasOwnProperty('musicArtist')) {
			const { externalChannelId } = d['payload']['musicArtist']
			// channelId = externalChannelId
			// console.log(d['payload']['musicArtist'])
		}
	})
	const channelId = data.contents?.singleColumnBrowseResultsRenderer?.tabs[0]
		?.tabRenderer?.content?.sectionListRenderer?.contents[1]
		?.musicCarouselShelfRenderer?.contents[0]?.musicTwoRowItemRenderer?.subtitle
		?.runs[2]?.navigationEndpoint?.browseEndpoint?.browseId
		? data.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer
				?.content?.sectionListRenderer?.contents[1]?.musicCarouselShelfRenderer
				?.contents[0]?.musicTwoRowItemRenderer?.subtitle?.runs[2]
				?.navigationEndpoint?.browseEndpoint?.browseId
		: arr[1].payload?.musicArtist?.externalChannelId
	// console.log(channelId)
	const releaseInfo = Array.from([info]).map((d) => {
		return {
			playlistId: d.audioPlaylistId,
			subtitles: [
				{
					year: d?.releaseDate?.year,
					tracks: d.trackCount,
					length: d.durationMs,
					contentRating: d.contentRating?.explicitType || null
				}
			],
			secondSubtitle: [],
			artist: { name: d.artistDisplayName, channelId },
			thumbnails: d?.thumbnailDetails?.thumbnails,
			title: d?.title,
			autoMixId: d?.radioAutomixPlaylistId
		}
	})
	// console.log(releaseInfo)

	if (info) playlistId = info.radioAutomixPlaylistId
	items = items.map((item) => {
		let explicit = false
		if (
			item.contentRating.explicitType.includes(
				'MUSIC_ENTITY_EXPLICIT_TYPE_EXPLICIT'
			)
		) {
			explicit = true
		}
		return {
			playlistId: playlistId ? playlistId : '',
			thumbnail: item.thumbnailDetails.thumbnails[0].url,
			videoId: item.videoId,
			title: item.title,
			index: item.albumTrackIndex,
			artistNames: item.artistNames,
			explicit: explicit
		}
	})
	// console.log(items)

	return {
		items,
		releaseInfo: releaseInfo[0]
	}
}
