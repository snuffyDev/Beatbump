// import { isOpen } from "./PopperButton.svelte";
import { get, writable } from "svelte/store";

type PopperStore = {
	items: any[];
	isOpen?: boolean;
	type?: "player" | string;
	metadata?: Partial<{
		thumbnail: string;
		// artist: string
		title: string;
		length?: string;
	}>;
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
export const activeNode = _activeNode();

function _activeNode() {
	const { subscribe, set } = writable<WeakRef<HTMLElement> | WeakRef<{ value: null }>>();
	return {
		subscribe,
		set: (node: WeakRef<HTMLElement> | WeakRef<{ value: null }>) => {
			set(node);
		},
		get: () => {
			return get(activeNode);
		},
	};
}
