// import { isOpen } from "./PopperButton.svelte";
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
		type: "",
	});
	return {
		subscribe,
		set: (options: PopperStore) => {
			isOpen.set(true);
			set(options);
		},
		reset: () => {
			isOpen.set(false);
			set({
				items: [],
				isOpen: false,
				type: undefined,
				x: undefined,
				y: undefined,
				bottom: undefined,
			});
			return false;
		},
	};
}

export const isOpen = writable(false);
