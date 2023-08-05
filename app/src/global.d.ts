/// <reference types="@sveltejs/kit" />
/// <reference types="svelte" />
/// <reference types="vite/client" />

declare namespace svelteHTML {
	interface Detail {
		velocityY?: number;
		clientY: number;
		startY: number;
		endY?: number;
		deltaY?: number;
		timeStamp: number;
		startTime: number;
	}
	type ActionEvent<EventDetail> = Omit<
		CustomEvent<EventDetail>,
		"currentTarget" | "target"
	> & {
		currentTarget: HTMLElement;
		target: HTMLElement;
	};
	interface HTMLAttributes<T> {
		"on:click_outside"?: () => void;
		"on:dragmove"?: (e: ActionEvent<any>) => void;
		"on:enterViewport"?: () => void;
		"on:losefocus"?: () => void;
		"on:pan"?: (event: ActionEvent<Detail>) => void;
		"on:pressing"?: (event: ActionEvent<Detail>) => void;
		"on:panend"?: (event: ActionEvent<Detail>) => void;
		"on:pressEnd"?: (e: ActionEvent<Detail>) => void;
	}
}
interface Array<T> {
	at(index: number): T | undefined;
}
