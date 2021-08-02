export function parsePageContents(data) {
	let info = {}
	let temp = []
	let playlistId
	// console.log(data)
	let items = []
	let {
		frameworkUpdates: {
			entityBatchUpdate: { mutations }
		}
	} = data
	let arr = mutations

	arr.forEach((d) => {
		if (d.payload.hasOwnProperty('musicTrack')) {
			items.push(d.payload.musicTrack)
		}
		if (d.payload.hasOwnProperty('musicAlbumRelease')) {
			Object.assign(info, d.payload.musicAlbumRelease)
			// console.log(info)
		}
	})
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

	return { items, details: { ...info } }
}
