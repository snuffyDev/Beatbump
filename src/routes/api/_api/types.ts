export interface Client {
	name?: "ANDROID" | "WEB_REMIX";
	version?: "17.13.3" | "1.20220404.01.00";
	utcOffsetMinutes?: number;
	visitorData?: string;
	gl?: string;
	readonly hl?: string;
	userAgent?: string;
}

export interface ClickTracking {
	clickTrackingParams: string;
}

export interface Context {
	client: Client;
	clickTracking?: ClickTracking;
	request: {
		useSsl: boolean;
	};
	user: {
		lockedSafetyMode: boolean;
	};
}

export enum Endpoints {
	Browse = "browse",
	Search = "search",
	Next = "next",
	Player = "player"
}
export interface APIEndpoints {
	readonly playlist: Endpoints.Browse;
	readonly search: Endpoints.Search;
	readonly next: Endpoints.Next;
	readonly player: Endpoints.Player;
	readonly artist: Endpoints.Browse;
}

export interface BaseClientConfig {
	clientName: "ANDROID" | "WEB_REMIX";
	clientVersion: Client["version"];
	visitorData?: string;
}

export interface ClientConfig extends BaseClientConfig {
	userAgent?: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36";
}
export type Body<T> = {
	[Property in keyof T]: T[Property];
};

export type RequestBody<T> = Body<T> & {
	context: Context;
};
