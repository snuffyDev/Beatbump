import { derived } from "svelte/store";
import SessionListService from "./sessionList";

/**
 * A derived store for read-only access to the current mix
 */
const queue = derived(SessionListService, ($list) => $list.mix);
/**
 * A derived store for read-only access to the current track
 */
const currentTrack = derived(SessionListService, ($list) => $list.mix[$list.position]);
/**
 * A derived store for read-only access to the current position
 */
const queuePosition = derived(SessionListService, ($list) => $list.position);

export { queue, currentTrack, queuePosition };
