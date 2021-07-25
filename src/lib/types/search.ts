import { writable } from 'svelte/store'

let items = []
let loading = false
let hasData = false

const searchList = writable({
	items,
	loading,
	hasData
})

export default {
	subscribe: searchList.subscribe,
	async paginateList() {
		return await fetch(
			`/api/search.json?q=` +
				`&filter=` +
				filter +
				`&params=${itct}${continuation.continuation ? `&ctoken=${ctoken}` : ''}`
		)
			.then((data) => data.json())
			.then((data) => {
				const res = data

				search.update((u) => [...u, ...res.contents])

				if (data?.error) {
					error = data?.error
				}
				ctoken = res.continuation.continuation
				itct = res.continuation.clickTrackingParams
				return { params: itct, continuation: ctoken }
			})
	}
}
