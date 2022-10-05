import type Hls from "hls.js";
import type * as KIT from "@sveltejs/kit";
import type { MaybePromise } from "@sveltejs/kit/types/private";
import type { IResponse } from "$lib/types/response";

interface CustomWindow extends Window {
	bbAudio: (audio: HTMLAudioElement) => { duration: number; src: string };
	bbPlayer: { src: string; duration: number; title: string };
}

declare global {
	interface Window {
		bbAudio: (audio: HTMLAudioElement) => { duration: number; src: string };
		hls: Hls;
		bbPlayer: { src?: string; duration?: number; title?: string };
	}
}
export {};
