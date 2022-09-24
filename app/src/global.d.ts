/// <reference types="@sveltejs/kit" />
/// <reference types="svelte" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-comlink/client" />

declare namespace svelte.JSX {
	interface HTMLAttributes<T> {
		onclick_outside?: () => void;
		ondragmove?: (e: any) => void;
		onenterViewport?: () => void;
		onlosefocus?: () => void;
		onpan?: (event: any) => void;
		onpanend?: (event: any) => void;
	}
}
interface Array<T> {
	at(index: number): T | undefined;
}
