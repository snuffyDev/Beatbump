import { writable } from "svelte/store";

export const fullscreenStore = writable<"open" | "closed">("closed");
