/* eslint-disable no-inner-declarations */
import { parseContents } from '$lib/endpoints/nextUtils';

import type { EndpointOutput, RequestHandler } from '@sveltejs/kit';

// import NextParser from "/nextUtils";

export const get: RequestHandler = async ({ url }) => {
	const query = url.searchParams;
	const params = query.get('params') || undefined;
	const itct = query.get('itct') || '';
	const videoId = query.get('videoId') || '';
	const playlistId = query.get('playlistId') || '';
	const ctoken = query.get('ctoken') || undefined;
	const clickTracking = query.get('clickParams') || undefined;
	const setVideoId = query.get('setVideoId') || undefined;
	const type = query.get('configType') || undefined;
	// console.log(params)
	try {
		const response = await fetch(
			`https://music.youtube.com/youtubei/v1/next?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
			{
				method: 'POST',
				body: JSON.stringify({
					context: {
						client: {
							clientName: 'WEB_REMIX',
							clientVersion: '0.1',
							visitorData: 'CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D'
						},
						user: {
							lockedSafetyMode: false
						}

						// clickTracking: {
						// 	clickTrackingParams: `${clickTracking}`
						// }
					},
					continuation: `${ctoken}`,
					isAudioOnly: true,
					enablePersistentPlaylistPanel: true,
					params: `${params ? encodeURIComponent(params) : itct}`,
					tunerSettingValue: 'AUTOMIX_SETTING_NORMAL',
					videoId: `${videoId}`,
					playlistSetVideoId: setVideoId,
					playlistId: `${playlistId}`,
					watchEndpointMusicConfig: {
						hasPersistentPlaylistPanel: true,
						musicVideoType: type ? type : 'MUSIC_VIDEO_TYPE_ATV'
					}
				}),
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'user-agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36 Edg/97.0.1072.62',
					'x-goog-authuser': '0',
					'x-goog-visitor-id': 'Cgs3UUllOTNTZmxSQSjw6ayPBg%3D%3D',
					'X-Goog-AuthUser': '0',
					'x-origin': 'https://music.youtube.com',

					'X-Goog-Visitor-Id': 'CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D',
					'x-youtube-client-name': '67',
					'x-youtube-client-version': '1.20210901.00.00',
					'x-youtube-device':
						'cbr=Edge+Chromium&cbrver=93.0.961.38&ceng=WebKit&cengver=537.36&cos=Windows&cosver=10.0&cplatform=DESKTOP&cyear=2011',
					'x-youtube-page-label': 'youtube.music.web.client_20210901_00_RC00',

					Origin: 'https://music.youtube.com'
				}
			}
		);
		if (!response.ok) {
			// NOT res.status >= 200 && res.status < 300
			return { status: response.status, body: response.statusText };
		}
		const data = await response.json();
		/* For when you are NOT listening to a song.
		 ********************************************/
		if (!ctoken) {
			const {
				contents: {
					singleColumnMusicWatchNextResultsRenderer: {
						tabbedRenderer: {
							watchNextTabbedResultsRenderer: {
								tabs: [
									{
										tabRenderer: {
											content: {
												musicQueueRenderer: {
													content: {
														playlistPanelRenderer: {
															contents = [],
															continuations: [
																{
																	nextRadioContinuationData: {
																		clickTrackingParams = '',
																		continuation = ''
																	} = {}
																} = {}
															] = []
														} = {}
													} = {}
												} = {}
											} = {}
										} = {}
									} = {}
								] = []
							} = {}
						} = {}
					} = {}
				} = {},
				currentVideoEndpoint: { watchEndpoint = {} } = {}
			} = data;
			const parsed = parseContents(
				contents,
				continuation,
				clickTrackingParams,
				watchEndpoint ? watchEndpoint : ''
			);
			return {
				status: 200,
				body: parsed
			};
		}
		/*
		 * This is for when you are already listening to a song
		 * !params above looks for the ITCT as a check.
		 **************************************/
		const {
			continuationContents: {
				playlistPanelContinuation: {
					contents = [],
					continuations: [
						{
							nextRadioContinuationData: {
								clickTrackingParams = '',
								continuation = ''
							} = {}
						} = {}
					] = [],
					...rest
				} = {}
			} = {}
		} = data;
		// return { body: { rest, contents, continuation, data, clickTrackingParams } }
		const parsed = parseContents(
			contents,
			continuation,
			clickTrackingParams,
			rest
		);
		// console.log(parsed)
		return {
			status: 200,
			body: JSON.stringify(parsed)
		};
	} catch (error) {
		console.error(error);
		return {
			status: 500,
			statusText: error
		};
	}
};
