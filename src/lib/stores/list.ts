/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { parseNextItem } from '$lib/parsers'
import type { Item, Song } from '$lib/types'
import { getSrc } from '$lib/utils'
import { currentTitle } from '$stores/stores'
import { alertHandler } from '$stores/stores'
import { writable } from 'svelte/store'

import { addToQueue } from '../utils'
import { filterAutoPlay, key, playerLoading } from './stores'

let hasList = false
let mix: Item[] = []
let continuation: string
let clickTrackingParams: string

let splitList: any[]
let splitListIndex = 0
let currentMixId: string
let loading = false
type ChunkedPlaylist = {
	chunks?: any[][]
	origLength?: number
}
let Chunked: ChunkedPlaylist = {}

let filterSetting = false

const list = writable({
	currentMixId,
	continuation,
	clickTrackingParams,
	mix
})
const fetchNext = async (
	params,
	videoId,
	playlistId,
	ctoken,
	playlistSetVideoId,
	clickTracking
) => {
	return await fetch(
		'/api/next.json?videoId=' +
			encodeURIComponent(videoId) +
			`${videoId ? `&playlistId=${playlistId}` : ''}` +
			`${params ? `&params=${params}` : ''}` +
			`${clickTracking ? `&clickTracking=${clickTracking}` : ''}` +
			`${ctoken ? `&ctoken=${ctoken}` : ''}` +
			`${playlistSetVideoId ? `&setVideoId=${playlistSetVideoId}` : ''}`,
		{
			headers: { accept: 'application/json' }
		}
	)
		.then((json) => json.json())
		.catch((err) => console.log(err))
}

const unsubscribe = filterAutoPlay.subscribe((setting) => {
	filterSetting = setting
})
unsubscribe()

const filterList = (list) => {
	return (mix = [...list].filter(
		((set) => (f) => !set.has(f.videoId) && set.add(f.videoId))(new Set())
	))
}

function split(arr, chunk) {
	const temp = []
	let i = 0

	while (i < arr.length) {
		temp.push(arr.slice(i, chunk + i))
		i += chunk
	}

	return temp
}
export default {
	subscribe: list.subscribe,
	set: list.set,
	async initList(
		videoId: string,
		playlistId?: string,
		keyId?: number,
		playlistSetVideoId?: string,
		clickTracking?: string
	) {
		loading = true
		playerLoading.set(loading)
		console.log(videoId, playlistId, keyId, playlistSetVideoId, clickTracking)
		keyId = keyId ? keyId : 0
		key.set(keyId)
		if (hasList) mix = []
		hasList = true

		const response = await fetchNext(
			'',
			videoId,
			playlistId ? playlistId : '',
			'',
			playlistSetVideoId ? playlistSetVideoId : '',
			clickTracking
		)
		const data = await response

		await getSrc(videoId)
		currentTitle.set(data.results[0].title)

		loading = false
		playerLoading.set(loading)

		continuation = data.continuation
		currentMixId = data.currentMixId
		clickTrackingParams = data.clickTrackingParams

		mix = [...data.results]
		list.set({ currentMixId, clickTrackingParams, continuation, mix })
	},
	removeItem(index) {
		mix.splice(index, 1)
		mix = [...mix]
		list.set({ currentMixId, clickTrackingParams, continuation, mix })
	},
	async addNext(item, key) {
		if (!item) return
		const length = await addToQueue(item.videoId)
		const nextItem = parseNextItem(item, length)
		mix.splice(key + 1, 0, nextItem)
		// console.log(mix, nextItem)

		list.set({ currentMixId, clickTrackingParams, continuation, mix })
	},
	async moreLikeThis(item) {
		if (!item) return
		loading = true
		playerLoading.set(loading)
		const response = await fetchNext(
			'',
			item.videoId,
			item.autoMixList,
			'',
			'',
			''
		)
		const data = await response
		console.log(data)
		mix.push(...data.results)
		continuation = data.continuation
		list.set({ currentMixId, clickTrackingParams, continuation, mix })
		loading = false
		playerLoading.set(loading)
	},
	async startPlaylist(playlistId: string, index = 0) {
		loading = true
		playerLoading.set(loading)
		if (hasList) mix = []
		hasList = true
		key.set(index)
		try {
			const data = await fetch(
				`/api/getQueue.json?playlistId=${playlistId}`
			).then((data) => data.json())
			mix = [...data]
			mix = [...mix.filter((item) => item.title)]
			if (mix.length > 50) {
				Chunked = {
					chunks: [...split(mix, 50)],
					origLength: mix.length
				}

				splitList = Chunked.chunks

				if (index < splitList[0].length) {
					mix = splitList[0]
				} else {
					let temp = []
					splitList.forEach((chunk, i) => {
						if (index > chunk.length) {
							temp = [...temp, splitList[i]]
						}
						if (index < chunk.length - 1 && index > splitList[i--].length) {
							mix = [...temp, ...splitList[i]]
						}
					})
				}
			}
			loading = false
			playerLoading.set(loading)

			list.set({ currentMixId, clickTrackingParams, continuation, mix })
			return await getSrc(mix[index].videoId)
		} catch (error) {
			console.error(`Error starting playlist!\nOriginal Error:\n${error}`)
			loading = false
			playerLoading.set(loading)
			alertHandler.set({ msg: 'Error starting playback', type: 'error' })
		}
	},
	async getMore(itct, videoId, playlistId, ctoken, clickTrackingParams) {
		let loading = true
		playerLoading.set(loading)
		if (splitList && mix.length < Chunked.origLength - 1) {
			splitListIndex++

			const src = await getSrc(mix[mix.length].videoId)
			mix = [...mix, ...splitList[splitListIndex]]
			filterSetting ? filterList([...mix]) : (mix = [...mix])
			loading = false
			playerLoading.set(loading)
			list.set({ currentMixId, clickTrackingParams, continuation, mix })
			return await src
		} else {
			/*  Fetch the next batch of songs for autoplay
				- autoId: current position in mix
				- itct: params for /api/player.json (typically 'OAHyAQIIAQ%3D%3D')
				- videoId: current videoId
				- playlistId: current playlistId
				- ctoken: continuation token retrieved when mix is first initialized
				- playlistSetVideoId: set to '' since it is not a Playlist, it only is an autoplay
				= clickTrackingParams: YouTube sends these for certain requests to prevent people
				using their API for this purpose  */
			const data = await fetchNext(
				itct,
				videoId,
				playlistId,
				ctoken,
				'',
				clickTrackingParams
			)
			mix = filterSetting
				? [...mix, ...data.results].filter(
						((set) => (f) => !set.has(f.videoId) && set.add(f.videoId))(
							new Set()
						)
				  )
				: [...mix, ...data.results]
			// mix = [...mix, ...data.results]
			continuation = data.continuation
			currentMixId = data.currentMixId
			clickTrackingParams = data.clickTrackingParams
			// mix.push(...mix)

			loading = false
			playerLoading.set(loading)
			list.set({ currentMixId, clickTrackingParams, continuation, mix })
			return await getSrc(data.results[0].videoId)
		}
	}
}
