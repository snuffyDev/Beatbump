import type {
	EndpointOutput,
	IncomingRequest,
	Request,
	RequestHandler
} from '@sveltejs/kit'
import * as api from '$lib/handlers'
import Context from './_modules/context'
import { sendRequest } from './_modules/request'
import { parseNextTrack } from './_modules/parsers/next'
import { parsePlaylist } from './_modules/parsers/playlist'
import { parseArtist } from './_modules/parsers/artist'
import type { NextContinuationData, RequestType } from '$lib/types'
const handler = async (data, endpoint) => {
	const Endpoint = {
		artist: api.artistHandler(data),
		playlist: api.playlistHandler(data)
	}

	return await Endpoint[endpoint]
}

const Parsers = async (
	endpoint: string,
	{
		data,
		hasContinuation
	}: {
		data: Record<string, any>
		hasContinuation?: boolean
	}
) => {
	const Endpoints = {
		next: await parseNextTrack(data, hasContinuation),
		player: () => data,
		playlist: await parsePlaylist(data),
		artist: await parseArtist(data)
	}

	return Endpoints[`${endpoint}`]
}

export const post = async (req) => {
	let { body }: { body: FormData & Record<string, any> & string } = req

	if (typeof body === 'string') {
		body = JSON.parse(body)
	}
	const endpoint = (body.get('endpoint') as string) || ''
	const path = (body.get('path') as string) || ''

	if (endpoint === 'player') {
		const videoId = (body.get('videoId') as string) || ''
		const playlistId = (body.get('playlistId') as string) || ''
		const ctx = Context.player(videoId, playlistId)
		console.log(ctx)
		const req = await sendRequest(ctx, {
			endpoint: 'player',
			videoId: videoId,
			playlistId: playlistId
		})
		return { status: 200, body: req }
	} else {
		type JSON = string &
			FormDataEntryValue & { [key: string]: string; value: string }
		// interface JSON extends NextContinuationData { [key: string]: string; value: string}
		const type = (body.get('type') as RequestType) || null
		const playlistId = (body.get('playlistId') as string) || ''
		const browseId = (body.get('browseId') as string) || ''
		const continuation = (body.get('continuation') as JSON) || null
		const ctx = Context.base(browseId, type)
		console.log('all: ' + body.keys())
		const request = await sendRequest(ctx, {
			endpoint,
			type,
			browseId: browseId ? browseId : playlistId,
			continuation
		})
		console.log(request)

		const response = await Parsers(path, {
			data: request,
			hasContinuation: continuation ? true : false
		})
		console.log('ENDPOINT: ' + response)
		return { status: 200, body: response }
		// const data = await response.json()
		// const body = await handler(data, endpoint)
		// if (body) {
		return {
			status: 500
			// body: body
		}
	}
	// }
}
