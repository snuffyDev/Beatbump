import { Logger } from "$lib/utils";
import type { RelatedEndpointResponse } from "src/routes/api/v1/related.json/+server";
import { derived } from "svelte/store";
import SessionListService from "./sessionList";

/**
 * A derived store for read-only access to the current mix
 */
const queue = derived(SessionListService, ($list) => $list.mix);
/**
 * A derived store for read-only access to the current track
 */
const currentTrack = derived(
	SessionListService,
	($list) => $list.mix[$list.position],
);
/**
 * A derived store for read-only access to the current position
 */
const queuePosition = derived(SessionListService, ($list) => $list.position);

const related = (() => {
	const prevPosition = undefined;
	const { subscribe } = derived<
		typeof SessionListService,
		RelatedEndpointResponse
	>(SessionListService, ($list, set) => {
		try {
			(async () => {
				if ($list.position === prevPosition) return;
				if ($list.related !== null) {
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
