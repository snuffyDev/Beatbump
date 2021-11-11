/// <reference types="@sveltejs/kit" />
/// <reference types="svelte" />
/// <reference types="vite/client" />

declare namespace svelte.JSX {
	interface HTMLAttributes<T> {
		onclick_outside?: () => void
	}
}
