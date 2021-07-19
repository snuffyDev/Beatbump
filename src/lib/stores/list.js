/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { parseItem } from '$lib/parsers'
import { getNext, getSrc } from '$lib/utils'
import { writable } from 'svelte/store'
import { filterAutoPlay } from './stores'
import { addToQueue } from './../utils'

let filterSetting = false
filterAutoPlay.subscribe((setting) => {
	filterSetting = setting
})
let hasList = false
let mix = []
let continuation = []
const list = writable({
	continuation,
	mix
})

export default {
	subscribe: list.subscribe,
	async initList(videoId, playlistId) {
		if (hasList) mix = []
		hasList = true
		const response = await getNext(0, '', videoId, playlistId, '')
		const data = await response
		await getSrc(videoId)
		continuation.push(...data.continuation)
		mix.push(...data.results)
		list.set({ continuation, mix })
	},
	async initArtistList(videoId, playlistId) {
		if (hasList) mix = []
		hasList = true
		const response = await fetch(
			`/api/artistNext.json?playlistId=${playlistId}&videoId=${videoId}`
		)
		const data = await response.json()
		// await getSrc(videoId);
		continuation.push(data.continuation)
		mix.push(...data)
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
		const data = await fetch(`/api/getQueue.json?playlistId=${playlistId}`)
		const response = await data.json()
		mix = [...response]
		await getSrc(mix[0].videoId)
		list.set({ continuation, mix })

		console.log(response)
	},
	async getMore(autoId, itct, videoId, playlistId, ctoken) {
		const data = await getNext(autoId, itct, videoId, playlistId, ctoken)

		mix.pop()
		await getSrc(data.results[0].videoId)

		filterSetting
			? (mix = [...mix, ...data.results].filter(
					((set) => (f) => !set.has(f.videoId) && set.add(f.videoId))(new Set())
			  ))
			: (mix = [...mix, ...data.results])

		list.set({ continuation, mix })
	}
}
