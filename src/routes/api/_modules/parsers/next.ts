import { parseContents } from '$lib/endpoints/nextUtils'

export const parseNextTrack = (data, itct) => {
	if (!itct) {
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
			body: parsed
		}
	}
	/*
	 * This is for when you are already listening to a song
	 * !itct above looks for the ITCT as a check.
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
		body: parsed
	}
}
