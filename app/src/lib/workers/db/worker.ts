/// <reference lib="webworker" />
/// <reference types="vite-plugin-comlink/client" />
import type { Actions, Methods } from "./types";
import { expose } from "comlink";
import { dbHandler } from "./db";
const worker = self as unknown as DedicatedWorkerGlobalScope;

export async function tx<
	Action extends Actions = any,
	Type extends "favorite" | "playlist" | "playlists" | "favorites" = any,
	Key extends keyof Methods & `${Action & string}${Capitalize<Type>}` = keyof Methods &
		`${Action & string}${Capitalize<Type>}`,
	Fn extends Methods[Key] = Methods[Key],
>(action: Action, type: Type, ...params: Parameters<Fn>): ReturnType<Fn> {
	return (await dbHandler(
		action,
		type,
		...(params as Parameters<Methods[keyof Methods & `${Action & string}${Capitalize<Type>}`]>),
	)) as ReturnType<Fn>;
}

export default function () {
	console.log(this, self);
	return {
		tx,
	};
}
expose({ tx });
