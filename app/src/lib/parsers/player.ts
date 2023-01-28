// import type { Dict } from "$lib/types/utilities";
// import { filter, iter } from "$lib/utils/collections";

const parseProxyRedir = (url: string) => {
	let new_url = url.replace("https://", "").split("/");

	new_url = new_url[2] !== undefined ? new_url[2] : new_url[1];
	url = "https://redirector.googlevideo.com/" + new_url;
	return url;
};

import type { Dict } from "$lib/types/utilities";
import { Logger, filterMap, map } from "$lib/utils";
import { buildDashManifest, type IFormat } from "$lib/utils/buildDashManifest";

export interface PlayerFormats {
	hls?: string;
	dash?: string;
	streams?: { url: string; original_url: string; mimeType: string }[];
}
export function sort({
	data = {},
	WebM = false,
	dash = false,
	proxyUrl = "",
}: {
	data: Dict<any>;
	WebM?: boolean;
	dash?: boolean;
	proxyUrl?: string;
}): PlayerFormats {
	let dash_manifest: string;

	if (dash === true) {
		const proxy_url = new URL(proxyUrl);
		const formats = map(data?.streamingData?.adaptiveFormats as Array<IFormat>, (item) => {
			const url = new URL(item.url);
			const host = url.host;
			url.host = proxy_url.host ?? "yt-hls-rewriter.onrender.com";
			url.searchParams.set("host", host);
			return {
				...item,
				url: url.toString(),
			};
		});
		const length = data?.videoDetails?.lengthSeconds;

		const manifest = buildDashManifest(formats, length);
		dash_manifest = "data:application/dash+xml;charset=utf-8;base64," + btoa(manifest);
	}

	const host = data?.playerConfig?.hlsProxyConfig?.hlsChunkHost;
	const formats: Array<any> = data?.streamingData?.adaptiveFormats as Array<any>;
	const hls =
		(data?.streamingData?.hlsManifestUrl as string).replace(
			/https:\/\/(.*?)\//,
			proxyUrl !== "" ? proxyUrl : "https://yt-hls-rewriter.onrender.com/",
		) +
		("?host=" + host);

	const arr = filterMap(
		formats,
		(item) => {
			if ((item.itag as number) < 139 && item.itag > 251) return null;
			if (WebM === true && item.itag === 251)
				return {
					original_url: item.url,
					url: parseProxyRedir(item.url),
					mimeType: "webm",
				};
			if (item.itag === 140)
				return {
					original_url: item.url,
					url: item.url,
					mimeType: "mp4",
				};
		},
		(it) => !!it,
	);
	// Logger.log(`[LOG:STREAM-URLS]: `, arr);
	return {
		hls,
		dash: dash_manifest,
		streams: arr,
	};
}
