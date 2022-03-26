import { writable } from "svelte/store";

type PopperStore = {
	items: any[];
	isOpen?: boolean;
	type?: "player" | string;
	metadata?: {
		thumbnail: string;
		// artist: string
		title: string;
		length?: string;
	};
	x?: number;
	y?: number;
	bottom?: number;
	srcNode?: HTMLElement;
	direction?: "normal" | "right";
};
export const PopperStore = _popperStore();
function _popperStore() {
	const { set, subscribe } = writable<PopperStore>({
		items: [],
		isOpen: false,
		type: ""
	});
	return {
		subscribe,
		set: (options: PopperStore) => set(options),
		reset: () =>
			set({
				items: [],
				isOpen: false,
				type: undefined,
				x: undefined,
				y: undefined,
				bottom: undefined
			})
	};
}
