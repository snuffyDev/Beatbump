import { browser } from "$app/environment";
import { throttle } from "$lib/utils";
import { readable, type StartStopNotifier, type Subscriber } from "svelte/store";

function mediaQuery(query: string): StartStopNotifier<boolean> {
	return (set: Subscriber<boolean>) => {
		let stop = () => {};
		if (browser) {
			const media = window.matchMedia(query);
			const updateStoreValue = () => set(media.matches);
			media.addEventListener("change", updateStoreValue);
			updateStoreValue();
			stop = () => media.removeEventListener("change", updateStoreValue);
		}
		return stop;
	};
}

export const isMobileMQ = readable(false, mediaQuery("screen and (max-width: 719px)"));

export const isDesktopMQ = readable(false, mediaQuery("screen and (min-width: 720px)"));

function size(bound: "innerWidth" | "innerHeight") {
	return (set: Subscriber<number>) => {
		// Throttle how often we update the store
		const throttledResize = throttle<Event>((event) => {
			requestAnimationFrame(() => {
				set(window[bound]);
			});
		}, 80);

		let stop = () => {};

		if (browser) {
			set(window[bound]);

			window.addEventListener("resize", throttledResize);

			stop = () => window.removeEventListener("resize", throttledResize);
		}
		return stop;
	};
}

/** Bound to `window.innerWidth */
export const windowWidth = readable(0, size("innerWidth"));

/** Bound to `window.innerHeight */
export const windowHeight = readable(0, size("innerHeight"));
