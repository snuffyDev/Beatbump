const parseProxyRedir = (url) => {
	let new_url = url.replace('https://', '')
	new_url = new_url.split('/')
	new_url = new_url[2] !== undefined ? new_url[2] : new_url[1]
	url = 'https://redirector.googlevideo.com/' + new_url
	return url
}

export const sort = (data, WebM = false) => {
	try {
		const json = data
		if (json['playabilityStatus']['status'].includes('ERROR')) {
			return [{ url: null, error: json.playabilityStatus.status }]
		}
		const streamingData = json.streamingData
		const formatParent = streamingData['formats'].concat(
			streamingData['adaptiveFormats']
		)
		let arr = []
		let getNext
		// console.log(formatParent, streamingData)

		formatParent.map((i) => {

			if (WebM && i.mimeType.includes('audio') &&
				i.audioChannels === 2 &&
				i.audioQuality.includes('AUDIO_QUALITY_MEDIUM')
				&& (i.mimeType.includes('mp4') || i.mimeType.includes('webm'))
			) {
				i.url = parseProxyRedir(i.url)
				i.mimeType = i.mimeType.includes('mp4') ? 'mp4' : 'webm'
				return arr.push(i)
			} else if (!WebM && i.mimeType.includes('audio') &&
				i.audioChannels === 2 &&
				i.audioQuality.includes('AUDIO_QUALITY_MEDIUM')
				&& i.mimeType.includes('mp4')) {

				i.url = parseProxyRedir(i.url)
				i.mimeType = 'mp4';
				return arr.push(i)
			}

		})
		// console.log(arr)
		if (arr.length !== 0) {
			// console.log('0!!!!')
			return arr.map((format) => {
				return {
					url: format.url,
					mimeType: format.mimeType
				}
			})
		}

		return [{ url: null, mimeType: null }]
		// return null
	} catch (e) {
		console.log('Fetch error', e)

		return null
	}
}
