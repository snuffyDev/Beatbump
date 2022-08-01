// import type { Dict } from "$lib/types/utilities";
// import { filter, iter } from "$lib/utils/collections";

const parseProxyRedir = (url: string) => {
	let new_url = url.replace("https://", "").split("/");

	new_url = new_url[2] !== undefined ? new_url[2] : new_url[1];
	url = "https://redirector.googlevideo.com/" + new_url;
	return url;
};

// export const sort = (data: Dict<any>, WebM = false) => {
// 	try {
// 		const json = data;
// 		if (json["playabilityStatus"]["status"].includes("ERROR")) {
// 			return [{ url: null, error: json.playabilityStatus.status }];
// 		}
// 		const streamingData = json.streamingData;
// 		const arr = [];
// 		if (streamingData["dashManifestUrl"]) {
// 			streamingData["formats"].map((format) => {
// 				if (
// 					format.audioChannels === 2 &&
// 					format.audioQuality.includes("AUDIO_QUALITY_MEDIUM") &&
// 					format.mimeType.includes("mp4")
// 				) {
// 					arr.push(format);
// 				}
// 			});
// 			if (arr.length !== 0) {
// 				// console.log('0!!!!')
// 				return arr.map((format) => {
// 					return {
// 						url: format.url,
// 						mimeType: format.mimeType,
// 					};
// 				});
// 			}

// 			return [{ url: null, mimeType: null }];
// 		}
// 		const formatParent = (streamingData["adaptiveFormats"] as unknown) as Array<Dict<any>>;
// 		// console.log(formatParent);
// 		const mp4Formats = { 139: 'LOW', 140: 'MEDIUM' };
// 		const webMFormats = { 249: "LOW", 250: "LOW", 251: "MEDIUM" };
// 		const length = formatParent.length;
// 		let idx = -1;
// 		while (++idx < length) {
// 			const item = formatParent[idx];

// 			if ((item.itag as number) < 139 && item.itag > 251) continue;
// 			if (WebM === true && item.itag === 251) arr.push({ original_url: item.url, url: parseProxyRedir(item.url), mimeType: 'webm' });
// 			if (item.itag === 140) arr.push({ original_url: item.url, url: parseProxyRedir(item.url), mimeType: 'mp4' });
// 			// 	arr.push();
// 		}

// 		if (arr.length !== 0) {
// 			return arr;
// 		}

// 		return [{ url: null, mimeType: null }];
// 	} catch (e) {
// 		console.log("Fetch error", e);

// 		return null;
// 	}
// };

import type { Dict } from "$lib/types/utilities";
import { map } from "$lib/utils";
import { buildDashManifest, type IFormat } from "$lib/utils/buildDashManifest";
import { buildXML, type XMLNode, type XMLRoot } from "$lib/utils/xmlBuilder";
import { settings } from "$stores/settings";

export interface PlayerFormats {
	hls: string;
	streams: { url: string; original_url: string; mimeType: string }[];
}
export function sort(data: Dict<any>, WebM = false, dash = true): PlayerFormats {
	if (dash === true) {
		const formats = map(data?.streamingData?.adaptiveFormats as Array<IFormat>, (item) => ({
			...item,
			url: item.url.replace(/https:\/\/(.*?)\//, "https://yt-hls-rewriter.onrender.com/") + ("?host=" + host),
		}));
		const length = data?.videoDetails?.lengthSeconds;

		const manifest = buildDashManifest(formats, length);
		console.log(manifest);
		return manifest;
	}
	const host = data?.playerConfig?.hlsProxyConfig?.hlsChunkHost;
	const formats = data?.streamingData?.adaptiveFormats as Array<any>;
	const hls =
		(data?.streamingData?.hlsManifestUrl as string).replace(
			/https:\/\/(.*?)\//,
			"https://yt-hls-rewriter.onrender.com/",
		) +
		("?host=" + host);

	let idx = -1;
	const length = formats?.length;
	const arr = [];
	while (++idx < length) {
		const item = formats[idx];
		if ((item.itag as number) < 139 && item.itag > 251) continue;
		if (WebM === true && item.itag === 251)
			arr.push({
				original_url:
					item.url.replace(/https:\/\/(.*?)\//, "https://yt-hls-rewriter.onrender.com/") + ("&host=" + host),
				url: parseProxyRedir(item.url),
				mimeType: "webm",
			});
		if (item.itag === 140)
			arr.push({
				original_url:
					item.url.replace(/https:\/\/(.*?)\//, "https://yt-hls-rewriter.onrender.com/") + ("&host=" + host),
				url: parseProxyRedir(item.url),
				mimeType: "mp4",
			});
		// 	arr.push();
	}
	return {
		hls,
		streams: arr,
	};
}
