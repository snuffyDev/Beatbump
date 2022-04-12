import { iter } from "$lib/utils/collections";

const parseProxyRedir = (url) => {
	let new_url = url.replace("https://", "").split("/");

	new_url = new_url[2] !== undefined ? new_url[2] : new_url[1];
	url = "https://redirector.googlevideo.com/" + new_url;
	return url;
};

export const sort = (data, WebM = false) => {
	try {
		const json = data;
		if (json["playabilityStatus"]["status"].includes("ERROR")) {
			return [{ url: null, error: json.playabilityStatus.status }];
		}
		const streamingData = json.streamingData;
		const arr = [];
		if (streamingData["dashManifestUrl"]) {
			streamingData["formats"].map((format) => {
				if (
					format.audioChannels === 2 &&
					format.audioQuality.includes("AUDIO_QUALITY_MEDIUM") &&
					format.mimeType.includes("mp4")
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
		const formatParent = streamingData["adaptiveFormats"];

		iter(formatParent, (item) => {
			let url = "";
			if (WebM === true) {
				item.mimeType.includes("audio") &&
					item.audioChannels === 2 &&
					item.audioQuality.includes("AUDIO_QUALITY_MEDIUM") &&
					(item.mimeType.includes("mp4") || item.mimeType.includes("webm")) &&
					(item.mimeType = item.mimeType.includes("mp4") ? "mp4" : "webm") &&
					arr.push({
						original_url: item.url,
						url: item.url,
						mimeType: item.mimeType
					});
			}
			if (WebM === false) {
				item.mimeType.includes("audio") &&
					item.audioChannels === 2 &&
					item.audioQuality.includes("AUDIO_QUALITY_MEDIUM") &&
					item.mimeType.includes("mp4") &&
					(item.mimeType = "mp4") &&
					arr.push({
						original_url: item.url,
						url: item.url,
						mimeType: item.mimeType
					});
			}
		});

		if (arr.length !== 0) {
			return arr;
		}

		return [{ url: null, mimeType: null }];
	} catch (e) {
		console.log("Fetch error", e);

		return null;
	}
};
