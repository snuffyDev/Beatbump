import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler<Record<string, any>> = async ({ query }) => {
	const videoId = query.get('videoId') || ''
	const playlistId = query.get('list') || ''
	const playerParams = query.get('playerParams') || ''
	try {
		const response = await fetch(
			'https://music.youtube.com/youtubei/v1/player?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30',
			{
				method: 'POST',
				body: JSON.stringify({
					videoId: `${videoId}`,
					context: {
						client: {
							hl: 'en',
							clientName: 'ANDROID',
							clientVersion: '16.02'
						},
						user: {
							lockedSafetyMode: false
						},
						captionParams: {}
					},
					params: playerParams ? playerParams : '',
					playlistId: `${playlistId}`
				}),
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					Origin: 'https://music.youtube.com'
				}
			}
		)

		if (!response.ok) {
			return { status: response.status, body: response.statusText }
		}
		const data = await response.json()

		return {
			status: 200,
			body: data
		}
	} catch (error) {
		console.error(error)
		return {
			status: 500,
			body: error.message
		}
	}
}
