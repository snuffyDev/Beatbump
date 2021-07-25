/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { parseItem } from '$lib/parsers'
import { getSrc } from '$lib/utils'
import { writable } from 'svelte/store'
import { filterAutoPlay, playerLoading } from './stores'
import { addToQueue } from './../utils'
import { currentTitle } from '$stores/stores'

const fetchNext = async (index, params, videoId, playlistId, ctoken) => {
	return await fetch(
		'/api/next.json?playlistId=' +
			encodeURIComponent(playlistId) +
			`${videoId ? `&videoId=${videoId}` : ''}` +
			`${params ? `&params=${params}` : ''}` +
			`${ctoken ? `&ctoken=${ctoken}` : ''}` +
			'&index=' +
			encodeURIComponent(index),
		{
			headers: { accept: 'application/json' }
		}
	)
		.then((json) => json.json())
		.catch((err) => console.log(err))
}

let filterSetting = false
filterAutoPlay.subscribe((setting) => {
	filterSetting = setting
})

let loading = false
playerLoading.subscribe((load) => {
	loading = load
})
let hasList = false
let mix = []
let continuation = []
let index = 0
const list = writable({
	continuation,
	mix
})

export default {
	subscribe: list.subscribe,
	async initList(videoId, playlistId) {
		loading = true
		playerLoading.set(loading)
		if (hasList) mix = []
		hasList = true
		const response = await fetchNext(0, '', videoId, playlistId, '')
		const data = await response
		// console.log(data)
		await getSrc(videoId)
		currentTitle.set(data.results[index].title)
		loading = false
		playerLoading.set(loading)
		continuation.push(...data.continuation)
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
		).then((data) => data.json())
		// await getSrc(videoId);
		loading = false
		playerLoading.set(loading)
		continuation.push(response.continuation)
		mix.push(...response)
		list.set({ continuation, mix })
	},
	async addNext(item, key) {
		if (!item) return
		const length = await addToQueue(item.videoId)
		const nextItem = parseItem(item, length)
		mix.splice(key + 1, 0, nextItem)
		// console.log(mix, nextItem)

		list.set({ continuation, mix })
	},
	async startPlaylist(playlistId) {
		loading = true
		playerLoading.set(loading)
		const data = await fetch(
			`/api/getQueue.json?playlistId=${playlistId}`
		).then((data) => data.json())
		mix = [...data]
		loading = false
		playerLoading.set(loading)
		await getSrc(mix[0].videoId)
		list.set({ continuation, mix })

		// console.log(data)
	},
	async getMore(autoId, itct, videoId, playlistId, ctoken) {
		loading = true
		playerLoading.set(loading)
		const data = await fetchNext(autoId, itct, videoId, playlistId, ctoken)

		mix.pop()
		await getSrc(data.results[0].videoId)

		loading = false
		playerLoading.set(loading)

		filterSetting
			? (mix = [...mix, ...data.results].filter(
					((set) => (f) => !set.has(f.videoId) && set.add(f.videoId))(new Set())
			  ))
			: (mix = [...mix, ...data.results])
		list.set({ continuation, mix })
	}
}
