import Context from './_modules/context'
import { sendRequest } from './_modules/request'
import { parseNextTrack } from './_modules/parsers/next'
import { parsePlaylist } from './_modules/parsers/playlist'
import { parseArtist } from './_modules/parsers/artist'
import type { Request } from '@sveltejs/kit'
import type { ReadOnlyFormData } from '@sveltejs/kit/types/helper'
type JSON = string &
	FormDataEntryValue & { [key: string]: string; value: string }

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
		release: await data,
		playlist: await parsePlaylist(data),
		artist: await parseArtist(data)
	}

	return await Endpoints[`${endpoint}`]
}

export const post = async ({ body }: { body: ReadOnlyFormData }) => {
	console.log(JSON.stringify(body))
	const endpoint = body.get('endpoint') || ''
	const path = body.get('path') || ''

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
	}
	const type = (body.get('type') as string) || null
	const playlistId = (body.get('playlistId') as string) || ''
	const browseId = (body.get('browseId') as string) || ''
	const continuation = (body.get('continuation') as JSON) || null
	const ctx = Context.base(browseId, type)
	// console.log('all: ' + body.keys())
	const request = await sendRequest(ctx, {
		endpoint,
		type,
		browseId: browseId ? browseId : playlistId,
		continuation
	})
	if (type === 'release') {
		return { status: 200, body: request }
	}
	// console.log(request)

	const response = await Parsers(path, {
		data: request,
		hasContinuation: continuation ? true : false
	})
	// console.log('ENDPOINT: ' + response)
	return { status: 200, body: response }

	// }
}
