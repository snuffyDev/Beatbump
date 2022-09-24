/// <reference types="vite-plugin-comlink/client" />

import { browser } from "$app/environment";

import { Mutex } from "$lib/utils/sync";
import type { Remote } from "comlink";
import type { Actions, Methods } from "./types";

import * as ComLink from "comlink";
import { notify } from "$lib/utils/utils";
import WorkerURL from "./worker-iife?url";

let worker: Remote<typeof import("./worker")>;
class IDBService {
	private worker: typeof worker;
	private lock: Mutex;
	private isReady = false;
	constructor() {
		if (!browser) return;

		this.lock = new Mutex();
		this.setup();
	}
	async setup() {
		if (!browser) return;
		if (worker) return worker;
		const workerInstance = await ComLink.wrap<typeof import("./worker")>(
			new Worker(WorkerURL, { name: "IDB", type: "classic" }),
		);
		this.isReady = true;
		return workerInstance;
	}
	async sendMessage<
		Action extends Actions = Actions,
		Type extends "favorite" | "playlist" | "playlists" | "favorites" = any,
		Key extends keyof Methods & `${Action & string}${Capitalize<Type>}` = keyof Methods &
			`${Action & string}${Capitalize<Type>}`,
		Fn extends Methods[Key] = Methods[Key],
	>(action: Action, type: Type, ...params: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>["data"]> {
		if (!browser) return;

		return await this.lock.do(async () => {
			if (!worker) worker = await this.setup();

			try {
				console.log(worker);
				///@ts-expect-error This works, don't know why it will come up as an error
				const response = await worker.tx(action, type, ...params);
				if (response.error) {
					notify(response.message, "error");
				}
				if (response.message) {
					notify(response.message, "success");
				}
				if (response.data) {
					return response.data;
				}
			} catch (err) {
				console.error(err);
			}
		});
	}
}
const service = new IDBService();
// service.sendMessage('');
// service.sendMessage('get', "favorites", "2020202").then(res => res[0].);

export { service as IDBService };
