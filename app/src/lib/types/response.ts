import type { Maybe } from "$lib/utils";

export interface IResponse<T = unknown> extends Response {
	json(): Promise<Maybe<T>>;
}
