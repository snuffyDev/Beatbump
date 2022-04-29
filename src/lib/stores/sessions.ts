import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

/**
 * !!TODO
 * - creates unique ID on startup
 * - send and receive commands to/from connected clients
 * - secure (passing messages *does not* allow for malicious code to be executed)
 *
 * Feature goals:
 * - optional forced sync (if one client is far behind the others,
 *   everyone's session will wait for the last person to catch up)
 *
 * -  allow users to play and pause music both freely as well as
 *   synced (client A pauses, which will pause clients B & C)
 *
 * -
 */
/// Protocol Types
type Message = "action" | "state" | "status";
type Command = "SEND" | "GET" | "CONNECT" | "DISCONNECT" | "CONFIG" | "PUT";
type Status = "OK" | "ERROR";

/// Client Types
type ClientID = string;
type Permissions = {
	modifyQueue: boolean;
	skipGlobal: boolean;
	playPauseGlobal: boolean;
};
interface Client {
	clientId: ClientID;
	role: "admin" | "basic";
	permissions: Permissions;
}
interface Settings {
	playStateGlobal: boolean;
	forceSync: boolean;
}
interface GroupSessionController {
	/** Send a command to connected clients */
	send: (cmd: Command, type: Message, data: string) => Status;
	/** Process data received from connected clients */
	process: (metadata: Record<string, any>, data: string) => unknown;
}
interface GroupSessionModel {
	connections: Client[];
	settings: Settings;
}
interface GroupSession extends GroupSessionController {
	subscribe: Writable<GroupSessionModel>["subscribe"];
}

function _groupSession() {
	const clients: Client[] = [];
	const settings: Settings = { forceSync: true, playStateGlobal: true };
}
