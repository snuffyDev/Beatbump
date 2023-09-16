export type TimerMessage = {
	type: "interval" | "timeout";
	action: "set" | "clear";
	id: string;
	ms: number;
	port: MessagePort;
};

export type TimerWorkerEvent = MessageEvent<TimerMessage>;

const timeouts: Map<
	string,
	{
		timer: ReturnType<typeof setTimeout>;
		type: "interval" | "timeout";
		channel: MessagePort;
	}
> = new Map();

const handleSet = ({ id, type, port, ms }: TimerMessage) => {
	switch (type) {
		case "interval":
			timeouts.set(id, {
				timer: setInterval(() => port.postMessage(id), ms),
				type,
				channel: port,
			});
			break;
		case "timeout":
			timeouts.set(id, {
				timer: setTimeout(() => port.postMessage(id), ms),
				type,
				channel: port,
			});
			break;
	}
};

const handleClear = ({ id }: TimerMessage) => {
	const timeout = timeouts.get(id);
	if (timeout) {
		switch (timeout.type) {
			case "interval":
				clearInterval(timeout.timer);
				break;
			case "timeout":
				clearTimeout(timeout.timer);
				break;
		}
		timeouts.delete(id);
	}
	timeout?.channel.close();
};

onmessage = (event: TimerWorkerEvent) => {
	const { action } = event.data;
	const channel = event.ports[0] as MessagePort;

	if (action === "clear") {
		handleClear(event.data);
	} else if (action === "set") {
		handleSet({ ...event.data, port: channel });
	}
};
