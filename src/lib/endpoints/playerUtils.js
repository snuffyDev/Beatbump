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
		let arr = []
		if (streamingData['dashManifestUrl']) {
			streamingData['formats'].map((format) => {
				if (

					format.audioChannels === 2 &&
					format.audioQuality.includes('AUDIO_QUALITY_MEDIUM') &&
					format.mimeType.includes('mp4')
				) {
					arr.push(format)
				}
			})
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
		}
		const formatParent = streamingData['formats'].concat(
			streamingData['adaptiveFormats']
		)
		for (let i = 0; i < formatParent.length; i++) {
			const element = formatParent[i];
			WebM === true && element.mimeType.includes('audio') && element.audioChannels === 2 && element.audioQuality.includes('AUDIO_QUALITY_MEDIUM') &&
				(element.mimeType.includes('mp4') || element.mimeType.includes('webm')) && (element.url = parseProxyRedir(element.url)) && ((
					element.mimeType = element.mimeType.includes('mp4') ? 'mp4' : 'webm')) && arr.push({ url: element.url, mimeType: element.mimeType })
			WebM === false && element.mimeType.includes('audio') && element.audioChannels === 2 && element.audioQuality.includes('AUDIO_QUALITY_MEDIUM') &&
				(element.mimeType.includes('mp4')) && (element.url = parseProxyRedir(element.url)) && ((
					element.mimeType = 'mp4')) && arr.push({ url: element.url, mimeType: element.mimeType })
		}
		// formatParent.map((i) => {
		// 	if (
		// 		WebM === true &&
		// 		i.mimeType.includes('audio') &&
		// 		i.audioChannels === 2 &&
		// 		i.audioQuality.includes('AUDIO_QUALITY_MEDIUM') &&
		// 		(i.mimeType.includes('mp4') || i.mimeType.includes('webm'))
		// 	) {
		// 		i.url = parseProxyRedir(i.url)
		// 		i.mimeType = i.mimeType.includes('mp4') ? 'mp4' : 'webm'
		// 		return arr.push(i)
		// 	} else if (
		// 		WebM === false &&
		// 		i.mimeType.includes('audio') &&
		// 		i.audioChannels === 2 &&
		// 		i.audioQuality.includes('AUDIO_QUALITY_MEDIUM') &&
		// 		i.mimeType.includes('mp4')
		// 	) {
		// 		i.url = parseProxyRedir(i.url)
		// 		i.mimeType = 'mp4'
		// 		return arr.push(i)
		// 	}
		// })
		if (arr.length !== 0) {
			return arr
		}

		return [{ url: null, mimeType: null }]

	} catch (e) {
		console.log('Fetch error', e)

		return null
	}
}
