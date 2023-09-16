import { browser } from "$app/environment";
import type { TimerMessage } from "$lib/workers/timers/worker";
import TimerWorker from "$lib/workers/timers/worker?worker";

const worker = browser ? new TimerWorker() : (undefined as never);

export type WorkerTimer = {
	clear: () => Promise<void> | undefined;
};

const createPort = (callback: () => void) => {
	const { port1: send, port2: recv } = new MessageChannel();

	recv.onmessage = callback.bind(callback);

	return [send, recv] as const;
};

const createTimer = ({
	ms,
	type,
	id,
	sender,
}: Omit<TimerMessage, "action" | "port"> & { sender: MessagePort }) => {
	worker?.postMessage(
		{
			ms,
			type,
			id,
			action: "set",
		},
		[sender],
	);
};

const clearTimer = (id: string, recv: MessagePort) => {
	if (!worker) return;

	const promise = new Promise((resolve) => {
		recv.onmessage = resolve;
	}).then(() => {
		recv.onmessage = null;
		recv.close();
	});

	worker.postMessage({ id, action: "CLEAR" });

	return promise;
};

function setWorkerTimer(
	cb: () => void,
	{
		type,
		ms = 500,
	}: {
		type: "interval" | "timeout";
		ms: number;
	},
): WorkerTimer {
	const id = crypto.randomUUID() as string;

	const [send, recv] = createPort(cb);

	createTimer({ id, ms, sender: send, type });

	return {
		clear: () => clearTimer(id, recv),
	};
}

/** Creates a `setInterval` that runs in a Web Worker  */
export const setWorkerInterval = (cb: () => void, ms: number) =>
	setWorkerTimer(cb, { ms, type: "interval" });

/** Creates a `setTimeout` that runs in a Web Worker  */
export const setWorkerTimeout = (cb: () => void, ms: number) =>
	setWorkerTimer(cb, { ms, type: "timeout" });
