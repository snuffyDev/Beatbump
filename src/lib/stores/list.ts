/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { parseNextItem } from '$lib/_parsers'
import { getSrc } from '$lib/utils'
import { currentTitle } from '$stores/stores'
import { writable } from 'svelte/store'

import { addToQueue } from '../utils'
import { filterAutoPlay, playerLoading } from './stores'

const filterList = (list) => {
	return (mix = [...list].filter(
		((set) => (f) => !set.has(f.videoId) && set.add(f.videoId))(new Set())
	))
}
const fetchNext = async (
	index,
	params,
	videoId,
	playlistId,
	ctoken,
	playlistSetVideoId
) => {
	return await fetch(
		'/api/next.json?playlistId=' +
			encodeURIComponent(playlistId) +
			`${videoId ? `&videoId=${videoId}` : ''}` +
			`${params ? `&params=${params}` : ''}` +
			`${ctoken ? `&ctoken=${ctoken}` : ''}` +
			`${playlistSetVideoId ? `&playerConf=${playlistSetVideoId}` : ''}` +
			'&index=' +
			encodeURIComponent(index),
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
filterAutoPlay.subscribe((setting) => {
	filterSetting = setting
})

let loading = false

let hasList = false
let mix = []
let continuation = []
let index = 0

let splitList = []
let splitListIndex = 0
const list = writable({
	continuation,
	mix
})
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
		key?: number,
		playlistSetVideoId?: string
	) {
		loading = true
		key = key ? key : 0
		playerLoading.set(loading)
		if (hasList) mix = []
		hasList = true
		const response = await fetchNext(
			key || 0,
			'',
			videoId,
			playlistId,
			'',
			playlistSetVideoId
		)
		const data = await response
		// console.log(data)
		// console.log(data)
		await getSrc(videoId)
		currentTitle.set(data.results[key].title)
		loading = false
		playerLoading.set(loading)
		continuation.push(data.continuation)
		mix.push(...data.results)
		list.set({ continuation, mix })
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
		continuation.push(resMix.continuation)
		mix.push(...resMix)
		list.set({ continuation, mix })
	},
	async addNext(item, key) {
		if (!item) return
		const length = await addToQueue(item.videoId)
		const nextItem = parseNextItem(item, length)
		mix.splice(key + 1, 0, nextItem)
		// console.log(mix, nextItem)

		list.set({ continuation, mix })
	},
	async moreLikeThis(item) {
		if (!item) return
		loading = true
		playerLoading.set(loading)
		const response = await fetchNext(0, '', item.videoId, item.autoMixList, '')
		const data = await response
		console.log(data)
		mix.push(...data.results)
		continuation.push(data.continuation)
		list.set({ continuation, mix })
		loading = false
		playerLoading.set(loading)
	},
	async startPlaylist(playlistId) {
		loading = true
		playerLoading.set(loading)
		const data = await fetch(
			`/api/getQueue.json?playlistId=${playlistId}`
		).then((data) => data.json())
		mix = [...data]
		if (mix.length > 50) {
			Chunked = { chunks: [...split(mix, 50)], origLength: mix.length }
			splitList = Chunked.chunks
			mix = splitList[0]
		}
		console.log(mix[0])
		console.log(splitList)
		loading = false
		playerLoading.set(loading)
		await getSrc(mix[0].videoId)
		list.set({ continuation, mix })

		// console.log(data)
	},
	async getMore(autoId, itct, videoId, playlistId, ctoken) {
		// console.log([...splitList].length, [...splitList])
		let loading = true
		playerLoading.set(loading)
		if (splitList && mix.length < Chunked.origLength - 1) {
			splitListIndex++
			mix.pop()

			mix = [...mix, ...splitList[splitListIndex]]
			await getSrc(mix[autoId++].videoId)
			loading = false
			filterSetting ? filterList([...mix]) : (mix = [...mix])
			list.set({ continuation, mix })
			playerLoading.set(loading)
		} else {
			const data = await fetchNext(autoId, itct, videoId, playlistId, ctoken)

			mix.pop()
			await getSrc(data.results[0].videoId)

			loading = false
			playerLoading.set(loading)

			filterSetting
				? (mix = [...mix, ...data.results].filter(
						((set) => (f) => !set.has(f.videoId) && set.add(f.videoId))(
							new Set()
						)
				  ))
				: (mix = [...mix, ...data.results])
			list.set({ continuation, mix })
		}
	}
}
