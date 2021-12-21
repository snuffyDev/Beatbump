/// <reference types="@sveltejs/kit" />
/// <reference types="svelte" />
/// <reference types="vite/client" />

declare namespace svelte.JSX {
	interface HTMLAttributes<T> {
		onclick_outside?: () => void
		ondragmove?: (e: any) => void
		onenterViewport?: () => void
		onlosefocus?: () => void
	}
}

interface Array<T> {
	at(index: number): T | undefined
}
if (!Array.prototype.at) {
	Array.prototype.at = function (index: number) {
		return this[this.length - index]
	}
}
declare let Audio: {
	prototype: void
	new (src?: string): void
}
