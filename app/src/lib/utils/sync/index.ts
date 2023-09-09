import { debounce } from "./debounce";
import type {
	EventCallback,
	EventListeners,
	EventType,
	IEventEmitter,
} from "./emitter";
import { EventEmitter, Messenger, messenger } from "./emitter";
import type { Receiver, Sender, SyncResult } from "./mpmc";
import { globalChannel, mpmc } from "./mpmc";
import { Mutex } from "./mutex";
import { throttle } from "./throttle";

export {
	EventEmitter,
	Messenger,
	Mutex,
	debounce,
	globalChannel,
	messenger,
	mpmc,
	throttle,
	type EventCallback,
	type EventListeners,
	type EventType,
	type IEventEmitter,
	type Receiver,
	type Sender,
	type SyncResult,
};
