import { browser } from "$app/environment";
import { page } from "$app/stores";
import { skipFirstInvocation } from "$lib/utils/skipFirstInvocation";
import type { Unsubscriber } from "svelte/store";
import { derived } from "svelte/store";
import { currentTrack } from "./list";

export const SITE_ORIGIN_URL = derived(page, ($page) => $page.url.origin);

export const playbackURLStateUpdater = ((defaultValue: boolean) => {
	let enabled = defaultValue;
	let subscriber: Unsubscriber | null = null;
	let oldState: History["state"] = {};
	let lastURL = "";
	let currentURL = "";
	let lastNonListenURL = "";

	if (browser) {
		if (!window.location.href.includes("listen")) {
			lastNonListenURL = window.location.href;
		}
		subscriber = currentTrack.subscribe(
			skipFirstInvocation(($currentTrack) => {
				if ($currentTrack && $currentTrack.videoId) {
					if (lastURL && !lastURL.includes("listen")) {
						lastNonListenURL = lastURL;
						lastURL = window.location.href;
					}
					const url = new URL(window.location.href);
					url.pathname = "/listen";
					url.searchParams.set("id", $currentTrack?.videoId ?? "");
					oldState = window.history.state;
					currentURL = url.toString();
				}

				if (enabled) {
					window.history.pushState(
						window.history.state,
						"",
						currentURL.toString(),
					);
				}
			}),
		);
	}

	return {
		setEnabled: (value: boolean) => {
			if (!browser) return;
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
		toggle() {
			if (!browser) return;
			enabled = !enabled;
			if (enabled) {
				if (!window.location.pathname.includes("listen"))
					lastNonListenURL = window.location.href;
				window.history.pushState(
					window.history.state,
					"",
					currentURL.toString(),
				);
			} else if (!enabled && lastNonListenURL) {
				window.history.pushState(
					window.history.state,
					"",
					lastNonListenURL.toString(),
				);
			}
		},
		dispose: () => {
			if (!browser) return;
			if (lastURL)
				window.history.pushState(window.history.state, "", lastURL.toString());

			subscriber?.();
		},
	};
})(false);
