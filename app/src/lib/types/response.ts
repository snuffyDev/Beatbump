import type { Maybe } from "$lib/utils";

type Res = Response;
export interface IResponse<T> extends Response {
	json(): Promise<Maybe<T>>;
}
const e: Res = {};
