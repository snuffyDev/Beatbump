/* eslint-disable @typescript-eslint/no-explicit-any */
import { browser, dev } from "$app/environment";
import { notify } from "$lib/utils/utils";
import type { Actions, Methods } from "./types";

type Deferred<T> = {
	promise: Promise<T>;
	resolve: (value: T | PromiseLike<T>) => void;
	reject: (reason: any) => void;
};

const Defer = <T>() => {
	const p: Partial<Deferred<T>> = {};

	p.promise = new Promise<T>((resolve, reject) => {
		p.resolve = resolve;
		p.reject = reject;
	});

	return p as Deferred<T>;
};

class IDBService {
	private queue: Deferred<any>[] = [];
	private worker: Worker | null = null;

	public process = <
		Action extends Actions = Actions,
		Type extends "favorite" | "playlist" | "playlists" | "favorites" = any,
		Key extends keyof Methods &
			`${Action & string}${Capitalize<Type>}` = keyof Methods &
			`${Action & string}${Capitalize<Type>}`,
		Fn extends Methods[Key] = Methods[Key],
	>(
		event: MessageEvent<Awaited<ReturnType<Fn>>>,
	) => {
		const { data } = event;
		const promise = this.queue.shift();
		if (!promise) return;
		if (data.error) {
			"message" in data && notify(data.message ?? "", "error");
		}

		if (data.message) {
			notify(data.message, "success");
		}

		if (data.data) {
			promise.resolve(data.data);
		}

		promise.resolve(data.data);
	};

	constructor() {
		if (!browser) return;
	}

	async sendMessage<
		Action extends Actions = Actions,
		Type extends "favorite" | "playlist" | "playlists" | "favorites" = any,
		Key extends keyof Methods &
			`${Action & string}${Capitalize<Type>}` = keyof Methods &
			`${Action & string}${Capitalize<Type>}`,
		Fn extends Methods[Key] = Methods[Key],
	>(
		action: Action,
		type: Type,
		...params: Parameters<Fn>
	): Promise<Awaited<ReturnType<Fn>>["data"]> {
		if (browser === false) {
			return;
		}
		if (this.worker === null) {
			this.worker = await this.setup();
		}

		const promise = Defer<Awaited<ReturnType<Fn>>["data"]>();

		this.queue.push(promise);

		this.worker?.postMessage({ action, type, params });

		return promise.promise;
	}

	public async setup() {
		if (!browser) return null;
		if (this.worker) return this.worker;
		const workerInstance = dev
			? new Worker(new URL("./worker.ts", import.meta.url), {
					type: "module",
					name: "idb",
			  })
			: new Worker(new URL("./worker.ts", import.meta.url), { name: "idb" });
		workerInstance.onmessage = this.process;
		return workerInstance;
	}
}

const service = new IDBService();

export { service as IDBService };
