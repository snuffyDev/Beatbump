import { browser } from "$app/environment";
import { page } from "$app/stores";
import { skipFirstInvocation } from "$lib/utils/skipFirstInvocation";
import type { Unsubscriber } from "svelte/store";
import { derived } from "svelte/store";
import { currentTrack } from "./list";

export const SITE_ORIGIN_URL = derived(page, ($page) => $page.url.origin);

export const playbackURLStateUpdater = (defaultValue: boolean) => {
	let enabled = defaultValue;
	let subscriber: Unsubscriber | null = null;
	let oldState: History["state"] = {};
	let lastURL = "";
	let currentURL = "";

	if (browser) {
		subscriber = currentTrack.subscribe(
			skipFirstInvocation(($currentTrack) => {
				if (enabled && $currentTrack && $currentTrack.videoId) {
					if (!lastURL.includes("listen")) {
						lastURL = window.location.href;
					}
					const url = new URL(window.location.href);
					url.pathname = "/listen";
					url.searchParams.set("id", $currentTrack?.videoId ?? "");
					oldState = window.history.state;
					window.history.pushState(window.history.state, "", url.toString());
					currentURL = url.toString();
				}
			}),
		);
	}

	return {
		setEnabled: (value: boolean) => {
			enabled = value;

			if (enabled) {
				lastURL = window.location.href;
				window.history.pushState(
					window.history.state,
					"",
					currentURL.toString(),
				);
			} else if (lastURL) {
				window.history.pushState(window.history.state, "", lastURL.toString());
			}
		},
		dispose: () => {
			if (lastURL)
				window.history.pushState(window.history.state, "", lastURL.toString());

			subscriber?.();
		},
	};
};
