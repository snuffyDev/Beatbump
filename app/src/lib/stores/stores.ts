import type { Item } from "$lib/types";
import { filter } from "$lib/utils/collections";
import { derived, writable } from "svelte/store";
import { settings } from "./settings";

export const ctxKey = {};
export const currentTitle = writable(undefined);

export type Alert = {
	msg?: string;
	action?: string;
	type?: string;
	id?: number;
};

// Derived from Settings
export const theme = derived(settings, ($settings) => $settings.appearance.Theme);
export const filterAutoPlay = derived(settings, ($settings) => $settings?.playback["Dedupe Automix"]);
export const preferWebM = derived(settings, ($settings) => $settings?.playback["Prefer WebM Audio"]);
export const preserveSearch = derived(settings, ($settings) => $settings?.search?.Preserve);
export const immersiveQueue = derived(settings, ($settings) => $settings?.appearance["Immersive Queue"]);
// Alert
export const alertHandler = _alertHandler();
function _alertHandler() {
	const { set, subscribe, update } = writable<Alert[]>([]);
	let id = -1;
	return {
		subscribe,
		add: ({ msg, type, action }: Alert) => {
			update((u) => [...u, { msg, type, action, id: ++id }]);
		},
		remove: ({ id }: Alert) => {
			update((u) => filter(u, (item) => item.id !== id));
		},
	};
}

export const isPagePlaying = _isPagePlaying();

function _isPagePlaying() {
	const pageIds = new Set<string>(["player-queue"]);

	const { subscribe, set } = writable<Set<string>>(pageIds);

	return {
		subscribe,
		add(id: string) {
			pageIds.add(id);
			set(pageIds);
		},
		clear() {
			pageIds.clear();
			set(pageIds);
		},
		has(id: string) {
			return pageIds.has(id);
		},
		remove(id: string) {
			if (!pageIds.has(id)) return;
			pageIds.delete(id);
		},
	};
}
export const playerLoading = writable(false);

export const showAddToPlaylistPopper = writable<{
	state: boolean;
	item?: Item | Item[] | unknown;
}>({ state: false });
export const showGroupSessionManager = writable<boolean>(false);
export const showGroupSessionCreator = writable<boolean>(false);
