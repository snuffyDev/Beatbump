import { debounce } from "./debounce";
import { throttle } from "./throttle";
import type { EventType, EventCallback, EventListeners, IEventEmitter } from "./emitter";
import { EventEmitter, Messenger, messenger } from "./emitter";
import type { SyncResult, Receiver, Sender } from "./mpmc";
import { mpmc, globalChannel } from "./mpmc";
import { Mutex } from "./mutex";

export {
	type EventCallback,
	EventEmitter,
	type EventListeners,
	type EventType,
	type IEventEmitter,
	Messenger,
	Mutex,
	type Receiver,
	type Sender,
	type SyncResult,
	debounce,
	globalChannel,
	messenger,
	mpmc,
	throttle,
};
