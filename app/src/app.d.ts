/// <reference types="@sveltejs/kit" />
/// <reference types="svelte" />
/// <reference types="vite/client" />

declare namespace App {
	interface Locals {
		iOS: boolean;
		Android: boolean;
	}

	interface Platform {}

	interface Session {
		iOS?: boolean;
		Android?: boolean;
	}

	interface Stuff {
		path?: string;
		page?: string;
	}
}
