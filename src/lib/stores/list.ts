/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { parseNextItem } from '$lib/_parsers'
import { getSrc } from '$lib/utils'
import { currentTitle } from '$stores/stores'
import { writable } from 'svelte/store'

import { addToQueue } from '../utils'
import { filterAutoPlay, key, playerLoading } from './stores'

let hasList = false
let mix = []
let continuation: string
let clickTrackingParams: string

let splitList: []
let splitListIndex = 0
let currentMixId: string
let loading = false

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
		'/api/next.json?playlistId=' +
			encodeURIComponent(playlistId) +
			`${videoId ? `&videoId=${videoId}` : ''}` +
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

let Chunked = {
	chunks: [],
	origLength: 0
}

let filterSetting = false

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
	async initList(
		videoId: string,
		playlistId: string,
		keyId?: number,
		playlistSetVideoId?: string,
		clickTracking?: string
	) {
		loading = true
		playerLoading.set(loading)
		console.log(videoId, playlistId, keyId, playlistSetVideoId, clickTracking)
		keyId = keyId ? keyId : 0
		key.set(0)
		if (hasList) mix = []
		hasList = true

		const response = await fetchNext(
			'',
			videoId,
			playlistId,
			'',
			playlistSetVideoId ? playlistSetVideoId : '',
			clickTracking
		)
		const data = await response

		await getSrc(videoId)
		currentTitle.set(data.results[keyId].title)

		loading = false
		playerLoading.set(loading)

		continuation = data.continuation
		currentMixId = data.currentMixId
		clickTrackingParams = data.clickTrackingParams

		mix.push(...data.results)
		list.set({ currentMixId, clickTrackingParams, continuation, mix })
	},
	async initArtistList(videoId, playlistId) {
		loading = true
		playerLoading.set(loading)

		if (hasList) mix = []
		hasList = true

		const response = await fetch(
			`/api/artistNext.json?playlistId=${playlistId}&videoId=${videoId}`
		)

		const resMix = await response.json()
		await getSrc(resMix[0].videoId)

		loading = false
		playerLoading.set(loading)

		continuation = resMix.continuation
		mix.push(...resMix)
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
	async startPlaylist(playlistId) {
		loading = true
		playerLoading.set(loading)
		key.set(0)
		const data = await fetch(
			`/api/getQueue.json?playlistId=${playlistId}`
		).then((data) => data.json())
		mix = [...data]
		if (mix.length > 50) {
			Chunked = { chunks: [...split(mix, 50)], origLength: mix.length }
			splitList = Chunked.chunks
			mix = splitList[0]
		}
		// console.log(mix[0])
		// console.log(splitList)
		loading = false
		playerLoading.set(loading)
		await getSrc(mix[0].videoId)
		list.set({ currentMixId, clickTrackingParams, continuation, mix })

		// console.log(data)
	},
	async getMore(itct, videoId, playlistId, ctoken, clickTrackingParams) {
		let loading = true
		playerLoading.set(loading)
		if (splitList && mix.length < Chunked.origLength - 1) {
			splitListIndex++
			mix.pop()

			mix = [...mix, ...splitList[splitListIndex]]
			await getSrc(mix[0].videoId)
			loading = false
			filterSetting ? filterList([...mix]) : (mix = [...mix])
			list.set({ currentMixId, clickTrackingParams, continuation, mix })
			playerLoading.set(loading)
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

			// console.log(data)
			await getSrc(data.results[0].videoId)

			// mix = [...mix, ...data.results]
			// mix = filterSetting ? filterList(mix) : mix
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
		}
	}
}
