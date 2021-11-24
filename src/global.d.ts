/// <reference types="@sveltejs/kit" />
/// <reference types="svelte" />
/// <reference types="vite/client" />

// import type { EndpointOutput } from "@sveltejs/kit";

declare namespace svelte.JSX {
	interface HTMLAttributes<T> {
		onclick_outside?: () => void
		ondragmove?: (e: any) => void
	}
}
declare let Audio: {
	prototype: void
	new (src?: string): void
}
declare global {
	namespace NodeJS {}
}
