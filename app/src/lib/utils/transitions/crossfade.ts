import { crossfade, fly } from "svelte/transition";

export const [send, receive] = crossfade({ duration: 400, fallback: fly });
