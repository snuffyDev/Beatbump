/* eslint-disable prefer-const */

import { MusicResponsiveListItemRenderer } from '$lib/parsers'
import type { Artist, Item, NextContinuationData, Thumbnail } from '$lib/types'
import type { IListItemRenderer } from '$lib/types/musicListItemRenderer'
import type { IPlaylistItem, PlaylistData } from '$lib/types/playlist'
import { pb } from '$lib/utils'

function parseTrack(contents = [], playlistId?): Array<IListItemRenderer> {
	const Tracks = contents.map((item) => {
		if (!item) {
			return null
		}
		return MusicResponsiveListItemRenderer(item, true, playlistId)
	})
	return Tracks
}

export const parsePlaylist = async (
	data: {
		header: {
			musicDetailHeaderRenderer: {
				description: { runs: [{ text: string }] }
				thumbnail: {}
			}
		}
		contents: {
			singleColumnBrowseResultsRenderer: {
				tabs: [
					{
						tabRenderer: {
							content: {
								// eslint-disable-next-line prefer-const
								sectionListRenderer: {
									// eslint-disable-next-line prefer-const
									contents: [
										{
											musicPlaylistShelfRenderer: {
												contents: Array<IListItemRenderer>
												playlistId: string
												continuations: NextContinuationData
											}
										}
									]
								}
							}
						}
					}
				]
			}
		}
	},
	next?: boolean
): Promise<PlaylistData> => {
	if (!next) {
		let {
			header: { musicDetailHeaderRenderer = {} } = {},
			contents: {
				singleColumnBrowseResultsRenderer: {
					tabs: [
						{
							tabRenderer: {
								content: {
									sectionListRenderer,
									sectionListRenderer: {
										contents: [
											{
												musicPlaylistShelfRenderer: {
													contents = [],
													playlistId = '',
													continuations = []
												} = {}
											}
										] = []
									} = {}
								} = {}
							} = {}
						} = {}
					] = []
				} = {}
			} = {}
		} = data

		// console.log(musicDetailHeaderRenderer)
		const cont: NextContinuationData = continuations
			? continuations[0]?.nextContinuationData
			: ''
		musicDetailHeaderRenderer = [musicDetailHeaderRenderer]
		const parseHeader = musicDetailHeaderRenderer.map(
			({
				description = {},
				subtitle = {},
				thumbnail = {},
				secondSubtitle = {},
				title = {}
			}) => {
				const subtitles = pb(subtitle, 'runs:text', false)
				const desc = pb(description, 'runs:0:text', false)
				const _title = pb(title, 'runs:0:text', false)
				secondSubtitle = pb(secondSubtitle, 'runs:text', false)
				return {
					data,
					description: desc,
					subtitles,
					thumbnails:
						thumbnail?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails ||
						null,
					playlistId: playlistId,
					secondSubtitle,
					title: _title || 'error'
				}
			}
		)[0]
		// const [contents] = playlist;

		const tracks = parseTrack(contents, playlistId).filter((e) => {
			return e != null
		})
		// console.log('TRACKS: ' + Tracks)
		return {
			continuations: cont,
			tracks,
			header: parseHeader
		}
	} else {
		const {
			responseContext: {
				serviceTrackingParams,
				serviceTrackingParams: [{ params: [{ value = '' }] = [] }] = []
			} = {},
			continuationContents: {
				musicPlaylistShelfContinuation: {
					contents = [],
					continuations = []
				} = {}
			} = {}
		} = await data
		console.log(`value: ${serviceTrackingParams[0].params.value} + ${value}`)
		// console.log(data, contents, continuations)
		const cont: NextContinuationData = continuations
			? continuations[0]?.nextContinuationData
			: null
		const Tracks = parseTrack(contents, value.slice(2))
		// console.log(referrer.slice(1))
		return {
			continuations: cont,

			tracks: Tracks
		}
	}
}
