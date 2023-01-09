import type Hls from "hls.js";
import type * as KIT from "@sveltejs/kit";
import type { MaybePromise } from "@sveltejs/kit/types/private";
import type { IResponse } from "$lib/types/response";

interface CustomWindow extends Window {
	bbAudio: (audio: HTMLAudioElement) => { duration: number; src: string };
	bbPlayer: { src: string; duration: number; title: string };
}

declare global {
	interface IBody<T> extends Body {
		readonly body: ReadableStream<Uint8Array> | null;
		readonly bodyUsed: boolean;
		arrayBuffer(): Promise<ArrayBuffer>;
		blob(): Promise<Blob>;
		formData(): Promise<FormData>;
		json<U = any>(): Promise<U extends unknown ? T : U>;
		text(): Promise<string>;
	}
	interface IResponse<T> extends IBody<T> {
		readonly headers: Headers;
		readonly ok: boolean;
		readonly redirected: boolean;
		readonly status: number;
		readonly statusText: string;
		readonly type: ResponseType;
		readonly url: string;
		clone(): IResponse<T>;
	}

	function fetch<T = any>(url: URL | RequestInfo, init?: RequestInit): Promise<IResponse<T>>;
	interface Window {
		bbAudio: (audio: HTMLAudioElement) => { duration: number; src: string };
		hls: Hls;
		bbPlayer: { src?: string; duration?: number; title?: string };
		fetch<T>(url: URL | string, init?: RequestInit): Promise<IResponse<T>>;
	}
}
export {};
