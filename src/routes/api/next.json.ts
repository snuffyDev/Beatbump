/* eslint-disable no-inner-declarations */
import { parseContents } from '$lib/endpoints/nextUtils'
import type { EndpointOutput } from '@sveltejs/kit'

// import NextParser from "/nextUtils";

export async function get({
	query
}: {
	query: URLSearchParams
}): Promise<EndpointOutput> {
	const params = query.get('params') || ''
	const video_id = query.get('videoId') || ''
	const playlist_id = query.get('playlistId') || ''
	const ctoken = query.get('ctoken') || ''
	const clickTracking = query.get('clickParams') || ''
	const setVideoId = query.get('setVideoId') || ''
	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/next?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
		{
			method: 'POST',
			body: JSON.stringify({
				context: {
					client: {
						clientName: 'WEB_REMIX',
						clientVersion: '0.1'
					},

					user: {
						enableSafetyMode: false
					}
					// clickTracking: {
					// 	clickTrackingParams: `${clickTracking}`
					// }
				},
				continuation: `${ctoken}`,
				isAudioOnly: true,
				enablePersistentPlaylistPanel: true,
				params: `${params}`,
				tunerSettingValue: 'AUTOMIX_SETTING_NORMAL',
				videoId: `${video_id}`,
				playlistSetVideoId: `${setVideoId}`,
				playlistId: `${playlist_id}`,
				watchEndpointMusicConfig: {
					hasPersistentPlaylistPanel: true,
					musicVideoType: 'MUSIC_VIDEO_TYPE_ATV'
				}
			}),
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				Origin: 'https://music.youtube.com'
			}
		}
	)
	if (!response.ok) {
		// NOT res.status >= 200 && res.status < 300
		return { status: response.status, body: response.statusText }
	}
	const data = await response.json()
	/* For when you are NOT listening to a song.
	 ********************************************/
	if (!params) {
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
		} = data
		const parsed = parseContents(
			contents,
			continuation,
			clickTrackingParams,
			watchEndpoint ? watchEndpoint : ''
		)
		return {
			status: 200,
			body: parsed
		}
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
	} = data
	// return { body: { rest, contents, continuation, data, clickTrackingParams } }
	const parsed = parseContents(
		contents,
		continuation,
		clickTrackingParams,
		rest
	)
	// console.log(parsed)
	return {
		status: 200,
		body: parsed
	}
}
