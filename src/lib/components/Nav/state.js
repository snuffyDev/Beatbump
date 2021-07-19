import { derived, writable } from 'svelte/store'

const settings = writable({
	theme: '',
	filterAutoPlay: undefined
})

export default {
	subscribe: settings.subscribe
}
