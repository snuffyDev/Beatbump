import { writable } from "svelte/store";

export const fullscreenStore = _fullscreenStore();

function _fullscreenStore() {
	const { subscribe, set, update } = writable<"open" | "closed">("closed");

	return {
		subscribe,
		set,
		update,
		toggle() {
			update((state) => (state !== "open" ? "open" : "closed"));
		},
	};
}
