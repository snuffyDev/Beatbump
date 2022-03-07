import {
	MusicResponsiveListItemRenderer,
	MusicTwoRowItemRenderer
} from '$lib/parsers';

import type { CarouselHeader, CarouselItem } from '$lib/types';
import type { NextContinuationData } from '$lib/types';
import type { IListItemRenderer } from '$lib/types/musicListItemRenderer';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ url }) => {
	const query = url.searchParams;
	const browseId = query.get('list') || '';
	const itct = query.get('itct') || '';
	const ctoken = query.get('ctoken') || '';
	const referrer = query.get('ref') || '';

	// console.log(browseId, ctoken)

	if (ctoken !== '') {
		return getPlaylistContinuation(browseId, referrer, ctoken, itct);
	}
	return getPlaylist(browseId, referrer);
};
async function getPlaylistContinuation(browseId, referrer, ctoken, itct) {
	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/browse?ctoken=${ctoken}` +
			`&continuation=${ctoken}&type=next&itct=${itct}&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
		{
			method: 'POST',
			body: JSON.stringify({
				context: {
					client: {
						clientName: 'WEB_REMIX',
						clientVersion: '1.20211025.00.00',
						visitorData: 'CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D'
					},
					user: {
						lockedSafetyMode: false
					}
				}
			}),
			headers: {
				'Content-Type': 'application/json; charset=utf-8',

				'X-Goog-AuthUser': '0',
				Origin: 'https://music.youtube.com',
				'x-origin': 'https://music.youtube.com',

				'X-Goog-Visitor-Id': 'CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D',
				referer:
					'https://music.youtube.com/playlist?list=' + referrer.slice(2) ||
					browseId
			}
		}
	);
	if (!response.ok) {
		return { status: response.status, body: response.statusText };
	}

	const data = await response.json();
	const {
		continuationContents: {
			musicPlaylistShelfContinuation: { contents = [], continuations = [] } = {}
		} = {}
	} = await data;
	// console.log(data, contents, continuations)
	let Tracks = [];
	let Carousel;
	const cont: NextContinuationData = continuations
		? continuations[0]?.nextContinuationData
		: null;
	if (
		data?.continuationContents?.sectionListContinuation?.contents[0]
			?.musicCarouselShelfRenderer
	) {
		Carousel = parseCarousel({
			musicCarouselShelfRenderer:
				data?.continuationContents?.sectionListContinuation?.contents[0]
					?.musicCarouselShelfRenderer
		});
		// console.log(Carousel, contents[0])
		// console.log(referrer.slice(1))
	} else {
		Tracks = parseTrack(contents, referrer.slice(2));
	}
	return {
		status: 200,
		body: JSON.stringify({
			continuations: cont,
			tracks: Tracks.length !== 0 && Tracks,
			carousel: Carousel
		})
	};
}
async function getPlaylist(browseId, referrer) {
	const response = await fetch(
		'https://music.youtube.com/youtubei/v1/browse?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30',
		{
			method: 'POST',
			body: JSON.stringify({
				context: {
					client: {
						// clientName: 'WEB_REMIX',
						// clientVersion: '1.20211025.00.00',
						clientName: 'WEB_REMIX',
						clientVersion: '0.1',
						deviceMake: 'google',
						platform: 'DESKTOP',
						deviceModel: 'bot',
						experimentIds: [],
						experimentsToken: '',
						osName: 'Googlebot',
						osVersion: '2.1',
						locationInfo: {
							locationPermissionAuthorizationStatus:
								'LOCATION_PERMISSION_AUTHORIZATION_STATUS_UNSUPPORTED'
						},
						musicAppInfo: {
							musicActivityMasterSwitch:
								'MUSIC_ACTIVITY_MASTER_SWITCH_INDETERMINATE',
							musicLocationMasterSwitch:
								'MUSIC_LOCATION_MASTER_SWITCH_INDETERMINATE',
							pwaInstallabilityStatus: 'PWA_INSTALLABILITY_STATUS_UNKNOWN'
						},
						utcOffsetMinutes: -new Date().getTimezoneOffset(),
						originalUrl: 'https://music.youtube.com/playlist?list=' + browseId,
						visitorData: 'CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D'
					},

					user: {
						lockedSafetyMode: false
					}
				},
				browseId: `${browseId}`,
				browseEndpointContextMusicConfig: {
					pageType: 'MUSIC_PAGE_TYPE_PLAYLIST'
				}
			}),
			headers: {
				'Content-Type': 'application/json; charset=utf-8',

				'X-Goog-AuthUser': '0',
				Origin: 'https://music.youtube.com',
				'x-origin': 'https://music.youtube.com',
				'X-Goog-Visitor-Id': 'CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D',

				'User-Agent':
					'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
				referer:
					'https://music.youtube.com/playlist?list=' + referrer || browseId
			}
		}
	);
	if (!response.ok) {
		return { status: response.status, body: response.statusText };
	}

	const data = await response.json();
	let musicDetailHeaderRenderer = {};
	if (Object.prototype.hasOwnProperty.call(data, 'header')) {
		const { musicDetailHeaderRenderer: detailHeader = {} } = data?.header;
		musicDetailHeaderRenderer = { ...detailHeader };
	}

	const {
		contents,
		playlistId,
		continuations
	} = data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents[0]?.musicPlaylistShelfRenderer;
	const _continue =
		data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer
			?.content?.sectionListRenderer?.continuations || null;

	// console.log(musicDetailHeaderRenderer)
	const cont: NextContinuationData = data?.contents
		?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content
		?.sectionListRenderer?.continuations
		? data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer
				?.content?.sectionListRenderer?.continuations[0]?.nextContinuationData
			? continuations !== undefined && continuations[0]?.nextContinuationData
			: _continue !== null && _continue[0]?.nextContinuationData
		: null;

	const getHeader = () => {
		const createArray = (key) =>
			Array.isArray(musicDetailHeaderRenderer[key]['runs']) &&
			(() => {
				let arr = [];
				for (const { text } of musicDetailHeaderRenderer[key]['runs']) {
					arr = [...arr, text];
				}
				return arr;
			})();
		const ALLOWED_KEYS = new Set([
			'subtitles',
			'secondSubtitle',
			'description',
			'thumbnail',
			'title'
		]);
		const key_map = Object.keys(musicDetailHeaderRenderer);
		let len = key_map.length;
		while (len--) {
			const key = key_map[len];
			if (!ALLOWED_KEYS.has(key)) {
				delete musicDetailHeaderRenderer[key];
			}
			if (
				(key === 'subtitles' || key === 'secondSubtitle') &&
				musicDetailHeaderRenderer[key]['runs']['length'] !== 0
			) {
				musicDetailHeaderRenderer[key] = createArray(key) ?? [];
			}
			if (
				key === 'description' &&
				Array.isArray(musicDetailHeaderRenderer[key]?.runs) &&
				musicDetailHeaderRenderer[key]?.runs.length !== 0
			) {
				musicDetailHeaderRenderer[key] =
					musicDetailHeaderRenderer[key].runs[0]?.text || undefined;
			}
			if (key === 'thumbnail') {
				musicDetailHeaderRenderer[key + 's'] =
					musicDetailHeaderRenderer[key]?.croppedSquareThumbnailRenderer
						?.thumbnail?.thumbnails || null;
				delete musicDetailHeaderRenderer[key];
			}
			if (key === 'title')
				musicDetailHeaderRenderer[key] =
					musicDetailHeaderRenderer[key]['runs'][0]['text'] || 'Error';
		}
		musicDetailHeaderRenderer['playlistId'] = playlistId;
		ALLOWED_KEYS.clear();
	};
	getHeader();

	const tracks = parseTrack(contents, playlistId ?? browseId.slice(2));

	return {
		status: 200,
		body: JSON.stringify({
			continuations: cont,
			tracks,
			carouselContinuations: _continue && _continue[0].nextContinuationData,
			header: musicDetailHeaderRenderer
		})
	};
}
function parseTrack(
	contents = [],
	playlistId?: string
): Array<IListItemRenderer> {
	let index = contents.length;
	while (index--) {
		contents[index] =
			MusicResponsiveListItemRenderer(contents[index], true, playlistId) ||
			undefined;
	}
	return contents;
}
function parseHeader(header: any[]): CarouselHeader[] {
	return header.map(({ musicCarouselShelfBasicHeaderRenderer } = {}) => ({
		title: musicCarouselShelfBasicHeaderRenderer['title']['runs'][0].text
	}));
}

function parseBody(contents): CarouselItem[] {
	return contents.map(({ ...r }) => {
		if (r.musicTwoRowItemRenderer) {
			return MusicTwoRowItemRenderer(r);
		}
		if (r.musicResponsiveListItemRenderer) {
			return MusicResponsiveListItemRenderer(r);
		}
		throw new Error("Unable to parse items, can't find " + `${r}`);
	});
}
function parseCarousel({ musicCarouselShelfRenderer }) {
	return {
		header: parseHeader([musicCarouselShelfRenderer.header])[0],
		results: parseBody(musicCarouselShelfRenderer.contents)
	};
}
