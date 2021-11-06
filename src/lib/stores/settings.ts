import { browser } from '$app/env'
import { get, writable } from 'svelte/store'

type theme = 'dark' | 'dim' | 'light' | 'midnight' | 'ytm'
type Settings = {
	theme?: theme | string
	dedupe?: boolean
	preferWebM?: boolean
}
let list: Settings = {
	theme: 'dark',
	dedupe: true,
	preferWebM: false
}
export const settings = _settings()
function _settings() {
	if (browser) {
		list = {
			theme: localStorage.getItem('theme'),
			dedupe: JSON.parse(localStorage.getItem('filterAutoPlay')) || true,
			preferWebM: JSON.parse(localStorage.getItem('preferWebM'))
		}
	}
	const { subscribe, set } = writable<Settings>(list)
	const values = () => ({})

	return {
		subscribe,
		set: (settings: Settings) => {
			const { theme, dedupe, preferWebM } = settings

			set({ theme: themeSet(theme), dedupe, preferWebM })
		}
	}
}
function themeSet(theme) {
	if (!browser) return

	const currentTheme = document.querySelector('html').classList.item(0)

	document.querySelector('html').classList.replace(currentTheme, theme)

	localStorage.setItem('theme', theme)
	return theme
}
