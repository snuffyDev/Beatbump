// @ts-nocheck
import type { PageLoad } from "./$types";
import { onMount, setContext, tick } from "svelte";
export const load = async ({ params }: Parameters<PageLoad>[0]) => {
	const playlistName = params.slug;
	return {
		playlistName,
	};
};
