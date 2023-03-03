import { browser, dev } from "$app/environment";
import type { IDBMessage, Actions, Methods } from "./types";
import { notify } from "$lib/utils/utils";

class IDBService {
	private worker: Worker = null;
	constructor() {
		if (!browser) return;
	}
	async setup() {
		if (!browser) return;
		if (this.worker) return this.worker;
		const workerInstance = dev
			? new Worker(new URL("./worker.ts", import.meta.url), { type: "module", name: "idb" })
			: new Worker(new URL("./worker.ts", import.meta.url), { name: "idb" });
		return workerInstance;
	}
	async sendMessage<
		Action extends Actions = Actions,
		Type extends "favorite" | "playlist" | "playlists" | "favorites" = any,
		Key extends keyof Methods & `${Action & string}${Capitalize<Type>}` = keyof Methods &
			`${Action & string}${Capitalize<Type>}`,
		Fn extends Methods[Key] = Methods[Key],
	>(action: Action, type: Type, ...params: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>["data"]> {
		if (browser === false) {
			return;
		}
		if (this.worker === null) {
			this.worker = await this.setup();
		}
		return await new Promise<Awaited<ReturnType<Fn>>["data"]>((resolve, reject) => {
			// Unfortunately in order to cleanup the event listener after
			// We have to define `process` here.
			function process<T extends IDBMessage<Awaited<ReturnType<Fn>>["data"]>>(event: MessageEvent<T>) {
				const { data } = event;

				if (data.error) {
					notify(data.message, "error");
				}

				if (data.message) {
					notify(data.message, "success");
				}

				if (data.data) {
					this.worker.onmessage = null;
					resolve(data.data);
				}

				this.worker.onmessage = null;
				resolve(data.data);
			}

			this.worker.onmessage = process;
			this.worker.postMessage({ action, type, params });
		});
	}
}

const service = new IDBService();

export { service as IDBService };
