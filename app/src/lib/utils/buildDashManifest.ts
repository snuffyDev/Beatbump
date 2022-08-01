import { buildXML, type XMLRoot } from "./xmlBuilder";

import type { XMLNode } from "./xmlBuilder";
import { iter } from "./collections";

function buildAudioNode(item: IFormat): XMLNode {
	const node: XMLNode = {
		type: "element",
		name: "Representation",
		attrs: {
			id: item.itag,
			codecs: item.mimeType
				.split(" ")[1]
				.match(/"[^"]*/)[0]
				.substr(1),
			bandwidth: item.bitrate,
		},
		nodes: [
			{
				type: "element",
				name: "AudioChannelConfiguration",
				attrs: {
					schemeIdUri: "urn:mpeg:dash:23003:3:audio_channel_configuration:2011",
					value: "2",
				},
			},
			{
				type: "element",
				name: "BaseURL",
				text: item.url,
			},
			{
				type: "element",
				name: "SegmentBase",
				attrs: {
					indexRange: `${item.indexRange.start}-${item.indexRange.end}`,
				},
				nodes: [
					{
						type: "element",
						name: "Initialization",
						attrs: {
							range: `${item.initRange.start}-${item.initRange.end}`,
						},
					},
				],
			},
		],
	};
	return node;
}

function buildVideoNode(item: IFormat): XMLNode {
	const node: XMLNode = {
		type: "element",
		name: "Representation",
		attrs: {
			id: item.itag,
			codecs: item.mimeType
				.split(" ")[1]
				.match(/"[^"]*/)[0]
				.substr(1),
			bandwidth: item.bitrate,
			width: item.width,
			height: item.height,
			maxPlayoutRate: "1",
			frameRate: item.fps,
		},
		nodes: [
			{
				type: "element",
				name: "BaseURL",
				text: item.url,
			},
			{
				type: "element",
				name: "SegmentBase",
				attrs: {
					indexRange: `${item.indexRange.start}-${item.indexRange.end}`,
				},
				nodes: [
					{
						type: "element",
						name: "Initialization",
						attrs: {
							range: `${item.initRange.start}-${item.initRange.end}`,
						},
					},
				],
			},
		],
	};
	return node;
}

function buildAdaptationSet(formats: IFormat[]) {
	const adaptationSets = [];
	const mimeTypes: string[] = [];
	const mimeObjects: any[][] = [[]];

	iter(formats, (item) => {
		if (item.mimeType.indexOf("video") !== -1 && !item?.videoOnly) return;

		const mimeType = item.mimeType;
		const mimeTypeIndex = mimeTypes.indexOf(mimeType);
		if (mimeTypeIndex > -1) mimeObjects[mimeTypeIndex].push(item);
		else {
			mimeTypes.push(mimeType);
			mimeObjects.push([]);
			mimeObjects[mimeTypes.length - 1].push(item);
		}
	});

	for (let i = 0; i < mimeTypes.length; i++) {
		let isVideoFmt = false;
		const adaptationSet: XMLNode = {
			type: "element",
			name: "AdaptationSet",
			attrs: {
				id: i,
				mimeType: mimeTypes[i].split("; ")[0],
				startWithSAP: "1",
				subsegmentAlignment: "true",
			},
			nodes: [],
		};
		if (!mimeTypes[i].includes("audio")) {
			adaptationSet.attrs.scanType = "progressive";
			isVideoFmt = true;
		}
		iter(mimeObjects[i], (item) => {
			if (isVideoFmt) {
				adaptationSet.nodes.push(buildVideoNode(item));
			} else {
				adaptationSet.nodes.push(buildAudioNode(item));
			}
		});
		adaptationSets.push(adaptationSet);
	}
	return adaptationSets;
}
export function buildDashManifest(formats: IFormat[], lengthInSeconds: string) {
	const root: XMLRoot = {
		declaration: {
			type: "declaration",
			attrs: {
				version: "1.0",
				encoding: "utf-8",
			},
		},
		nodes: [
			{
				type: "element",
				name: "MPD",
				attrs: {
					xmlns: "urn:mpeg:dash:schema:mpd:2011",
					profiles: "urn:mpeg:dash:profile:full:2011",
					"xmlns:yt": "http://youtube.com/yt/2012/10/10",
					minBufferTime: "PT1.5S",
					type: "static",
					mediaPresentationDuration: `PT${lengthInSeconds}S`,
				},
				nodes: [
					{
						type: "element",
						name: "Period",
						nodes: buildAdaptationSet(formats),
					},
				],
			},
		],
	};
	return buildXML(root);
}

export interface IFormat {
	itag: number;
	url: string;
	mimeType: string;
	bitrate: number;
	width?: number;
	height?: number;
	initRange: InitRange;
	indexRange: InitRange;
	lastModified: string;
	contentLength: string;
	quality: string;
	fps?: number;
	qualityLabel?: string;
	projectionType: string;
	averageBitrate: number;
	approxDurationMs: string;
	highReplication?: boolean;
	audioQuality?: string;
	audioSampleRate?: string;
	audioChannels?: number;
	loudnessDb?: number;
}

interface InitRange {
	start: string;
	end: string;
}
