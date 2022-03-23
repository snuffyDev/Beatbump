import { browser } from '$app/env';
import { writable } from 'svelte/store';

type theme = 'dark' | 'dim' | 'midnight' | 'ytm';
type Settings = {
	theme?: theme | string;
	dedupe?: boolean;
	preferWebM?: boolean;
};
let list: Settings = {
	theme: 'dark',
	dedupe: true,
	preferWebM: false
};
export const settings = _settings();
function _settings() {
	if (browser) {
		list = {
			theme: localStorage.getItem('theme') as theme,
			dedupe: JSON.parse(localStorage.getItem('filterAutoPlay')) || true,
			preferWebM: JSON.parse(localStorage.getItem('preferWebM'))
		};
	}
	if (!list.theme.match(/dark|midnight|dim|ytm/)) {
		list = { ...list, theme: 'dark' };
		themeSet('dark');
	}
	const { subscribe, set } = writable<Settings>(list);

	return {
		subscribe,
		set: (settings: Settings) => {
			const { theme, dedupe, preferWebM } = settings;

			set({ theme: themeSet(theme), dedupe, preferWebM });
		}
	};
}
function themeSet(theme) {
	if (!browser) return;

	const currentTheme = document.querySelector('html').classList.item(0);

	document.querySelector('html').classList.replace(currentTheme, theme);

	localStorage.setItem('theme', theme);
	return theme;
}
