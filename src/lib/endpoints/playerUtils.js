const parseProxyRedir = (url) => {
	let new_url = url.replace('https://', '');
	new_url = new_url.split('/');
	new_url = new_url[2] !== undefined ? new_url[2] : new_url[1];
	url = 'https://redirector.googlevideo.com/' + new_url;
	return url;
};

export const sort = (data, WebM = false) => {
	try {
		const json = data;
		if (json['playabilityStatus']['status'].includes('ERROR')) {
			return [{ url: null, error: json.playabilityStatus.status }];
		}
		const streamingData = json.streamingData;
		let arr = [];
		if (streamingData['dashManifestUrl']) {
			streamingData['formats'].map((format) => {
				if (
					format.audioChannels === 2 &&
					format.audioQuality.includes('AUDIO_QUALITY_MEDIUM') &&
					format.mimeType.includes('mp4')
				) {
					arr.push(format);
				}
			});
			if (arr.length !== 0) {
				// console.log('0!!!!')
				return arr.map((format) => {
					return {
						url: format.url,
						mimeType: format.mimeType
					};
				});
			}

			return [{ url: null, mimeType: null }];
		}
		const formatParent = streamingData['formats'].concat(
			streamingData['adaptiveFormats']
		);
		let len = formatParent.length;
		for (; len--; ) {
			let url;
			WebM === true &&
				formatParent[len].mimeType.includes('audio') &&
				formatParent[len].audioChannels === 2 &&
				formatParent[len].audioQuality.includes('AUDIO_QUALITY_MEDIUM') &&
				(formatParent[len].mimeType.includes('mp4') ||
					formatParent[len].mimeType.includes('webm')) &&
				(url = parseProxyRedir(formatParent[len].url)) &&
				(formatParent[len].mimeType = formatParent[len].mimeType.includes('mp4')
					? 'mp4'
					: 'webm') &&
				arr.push({
					original_url: formatParent[len].url,
					url: url,
					mimeType: formatParent[len].mimeType
				});
			WebM === false &&
				formatParent[len].mimeType.includes('audio') &&
				formatParent[len].audioChannels === 2 &&
				formatParent[len].audioQuality.includes('AUDIO_QUALITY_MEDIUM') &&
				formatParent[len].mimeType.includes('mp4') &&
				(url = parseProxyRedir(formatParent[len].url)) &&
				(formatParent[len].mimeType = 'mp4') &&
				arr.push({
					original_url: formatParent[len].url,
					url: url,
					mimeType: formatParent[len].mimeType
				});
		}

		if (arr.length !== 0) {
			return arr;
		}

		return [{ url: null, mimeType: null }];
	} catch (e) {
		console.log('Fetch error', e);

		return null;
	}
};
