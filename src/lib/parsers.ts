export function parseItem(item, length) {
	item = [item]
	const result = item.map((item) => {
		const title = item.title

		return {
			title: title,
			artistInfo: {
				pageType: 'MUSIC_PAGE_TYPE_ARTIST',
				artist: item.subtitle[0]?.text,
				browseId: item.subtitle[0]?.navigationEndpoint?.browseEndpoint?.browseId
			},
			videoId: item.videoId,
			autoMixList: item.playlistId,
			thumbnail: item.thumbnails[0].url,
			length: length
		}
	})
	return result[0]
}
