import type { Dict } from "$lib/types/utilities";
import { buildDashManifest, type IFormat } from "$lib/utils/buildDashManifest";
import { filterMap, map } from "$lib/utils/collections/array";
import type { UserSettings } from "$stores/settings";
export interface PlayerFormats {
	hls?: string;
	dash?: string;
	streams?: { url: string; original_url: string; mimeType: string }[];
	video?: string;
}

/** Creates a new `redirector.googlevideo.com` URL */
const createRedirectorURL = (url: string) => {
	let new_url: string | string[] = url.replace("https://", "").split("/");

	new_url = new_url[2] !== undefined ? new_url[2] : new_url[1];
	url = "https://redirector.googlevideo.com/" + new_url;
	return url;
};

const YOUTUBE_MP4_VIDEO_ONLY_ITAGS = [
	134, // 360p
	135, // 480p
	136, // 720p
];

export function sort({
	data = {},
	WebM = false,
	dash = false,
	$proxySettings,
}: {
	data: Dict<any>;
	WebM?: boolean;
	dash?: boolean;
	$proxySettings: UserSettings["network"];
}): PlayerFormats {
	let dash_manifest = "";

	const proxyUrl = ($proxySettings as Required<UserSettings["network"]>)[
		"Stream Proxy Server"
	];
	const canProxy = $proxySettings["Proxy Streams"] === true;

	if (dash === true) {
		const proxy_url = canProxy ? new URL(proxyUrl) : new URL("");
		const formats = map(
			data?.streamingData?.adaptiveFormats as Array<IFormat>,
			(item) => {
				const url = new URL(item.url);
				const host = url.host;
				url.host = proxy_url.host ?? "hls.beatbump.io";
				url.searchParams.set("host", host);
				return {
					...item,
					url: url.toString(),
				};
			},
		);
		const length = data?.videoDetails?.lengthSeconds;

		const manifest = buildDashManifest(formats, length);
		dash_manifest =
			"data:application/dash+xml;charset=utf-8;base64," + btoa(manifest);
	}

	const host = data?.playerConfig?.hlsProxyConfig?.hlsChunkHost;
	const formats: Array<any> = data?.streamingData
		?.adaptiveFormats as Array<any>;
	const hostRegex = /https:\/\/(.*?)\//;
	const hls =
		(data?.streamingData?.hlsManifestUrl as string).replace(
			hostRegex,
			proxyUrl ? proxyUrl : "https://hls.beatbump.io/",
		) +
		("?host=" + host);

	let video = "";

	const arr = filterMap<
		Record<string, string>,
		{ original_url: string; mimeType: "mp4" | "webm"; url: string } | null
	>(
		formats,
		(item) => {
			const url = new URL(item.url);
			if (canProxy) {
				url.searchParams.set("host", url.host);
				url.host = new URL(proxyUrl).host;
			}
			const itag = parseInt(item.itag.toString());

			if (!video && YOUTUBE_MP4_VIDEO_ONLY_ITAGS.includes(itag)) {
				if (video) return null;
				video = createRedirectorURL(item.url);
				return null;
			}

			if (WebM === true && itag === 251)
				return {
					original_url: url.toString(),
					url: createRedirectorURL(item.url),
					mimeType: "webm",
				};
			if (itag === 140) {
				return {
					original_url: url.toString(),
					url: url.toString(),
					mimeType: "mp4",
				};
			}
		},
		(it) => !!it,
	);
	// Logger.log(`[LOG:STREAM-URLS]: `, arr);
	return {
		hls,
		dash: dash_manifest,
		streams: arr as NonNullable<(typeof arr)[number]>[],
		video,
	};
}
