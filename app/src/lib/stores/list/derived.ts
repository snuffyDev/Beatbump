import { derived } from "svelte/store";
import type { ISessionListProvider } from "./types.list";
import type { RelatedEndpointResponse } from "src/routes/api/v1/related.json/+server";
import { Logger } from "$lib/utils";
import { AudioPlayer } from "$lib/player";

const tryCatch = <T extends any[]>(cb: (...args: T) => void) => {
	return (...args: [T, ...T]) => {
		try {
			return cb(...args);
		} catch (e) {
			console.warn(e);
			//
		}
	};
};

/**
 * A derived store for read-only access to the current mix
 */
const queue = derived<typeof AudioPlayer, ISessionListProvider["mix"]>(
	AudioPlayer,
	($list, set) => set($list?.mix ?? []),
);
/**
 * A derived store for read-only access to the current track
 */
const currentTrack = derived<
	typeof AudioPlayer,
	ISessionListProvider["mix"][number]
>(
	AudioPlayer,
	tryCatch(($list) => $list?.mix[$list?.position ?? 0] ?? {}),
);
/**
 * A derived store for read-only access to the current position
 */
const queuePosition = derived<
	typeof AudioPlayer,
	ISessionListProvider["position"]
>(
	AudioPlayer,
	tryCatch(($list) => $list?.position ?? 0),
);

const related = (() => {
	const prevPosition = undefined;
	const { subscribe } = derived<
		typeof SessionListService,
		RelatedEndpointResponse
	>(AudioPlayer, ($list, set) => {
		try {
			(async () => {
				if ($list?.position === prevPosition) return;
				if ($list?.related !== null) {
					await fetch<RelatedEndpointResponse>(
						`/api/v1/related.json?browseId=${$list.related?.browseId}`,
					)
						.then((res) => res.json())
						.then(set);
				}
			})();
		} catch (err) {
			Logger.err(err);
		}
	});
	return { subscribe };
})();

export { queue, currentTrack, queuePosition, related };
