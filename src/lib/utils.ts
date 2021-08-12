/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from './api'
import { sort } from './endpoints/playerUtils'
import { alertHandler, updateTrack } from './stores/stores'
import { key } from './stores/stores'

// Shuffle array positions
export function shuffle(array: any[]) {
	array.sort(() => Math.random() - 0.5)
}
function format(seconds) {
	if (isNaN(seconds)) return '...'

	const minutes = Math.floor(seconds / 60)
	seconds = Math.floor(seconds % 60)
	if (seconds < 10) seconds = '0' + seconds

	return `${minutes}:${seconds}`
}

// Fetches a song length for adding to queue
export const addToQueue = async (videoId: string): Promise<string> => {
	const url = `/api/player.json${videoId ? `?videoId=${videoId}` : ''}`
	const data = await fetch(url, { headers: { accept: 'application/json' } })
		.then((json) => json.json())
		.catch((err) => console.log(err))
	const length = format(data.videoDetails.lengthSeconds)
	return length
}

// Get source URLs
export const getSrc = async (videoId?: string, playlistId?: string) => {
	const res = await api('player', {
		videoId: videoId ? videoId : '',
		playlistId: playlistId ? playlistId : ''
	})
	const data = await res.body
	const formats = await sort(data)

	const src = formats[0].url !== null ? setTrack(formats) : handleError()
	return src
}
function setTrack(formats) {
	const parsedURL = formats[0].url
	updateTrack.set(parsedURL)
	return { body: parsedURL, error: false }
}
function handleError() {
	console.log('error')
	alertHandler.set({
		msg: 'No audio stream found, skipping.',
		action: 'getNextTrack',
		type: 'danger'
	})
	return {
		body: null,
		error: true
	}
}
// parse array object input for child

export const pb = (input: any, query: string, justOne = false) => {
	const iterate = (x: string | any[], y: string | number) => {
		let r = []

		x.hasOwnProperty(y) && r.push(x[y])
		if (justOne && x.hasOwnProperty(y)) {
			return r.shift()
		}

		if (x instanceof Array) {
			for (let i = 0; i < x.length; i++) {
				r = r.concat(iterate(x[i], y))
			}
		} else if (x instanceof Object) {
			const c = Object.keys(x)
			if (c.length > 0) {
				for (let i = 0; i < c.length; i++) {
					r = r.concat(iterate(x[c[i]], y))
				}
			}
		}
		return r.length == 1 ? r.shift() : r
	}

	let d = query.split(':'),
		v = input
	for (let i = 0; i < d.length; i++) {
		v = iterate(v, d[i])
	}
	return v
}
