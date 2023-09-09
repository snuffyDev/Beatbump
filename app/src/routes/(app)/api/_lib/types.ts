export interface Client {
	readonly hl?: string;

	clientName?: "ANDROID" | "WEB_REMIX" | "IOS";
	clientVersion?: "17.13.3" | "1.20230501.01.00";
	gl?: string;
	originalUrl?: string;
	remoteHost?: string;
	userAgent?: string;
	utcOffsetMinutes?: number;
	visitorData?: string;
}

export interface ClickTracking {
	clickTrackingParams?: string | undefined;
}

export interface Context {
	captionParams: Record<string, never>;
	clickTracking?: ClickTracking;
	client: Client;
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
	Player = "player",
}
export interface APIEndpoints {
	readonly artist: Endpoints.Browse;
	readonly browse: Endpoints.Browse;
	readonly home: Endpoints.Browse;
	readonly next: Endpoints.Next;
	readonly player: Endpoints.Player;
	readonly playlist: Endpoints.Browse;
	readonly related: Endpoints.Browse;
	readonly search: Endpoints.Search;
}

export interface BaseClientConfig {
	clientName: "ANDROID" | "WEB_REMIX";
	clientVersion: Client["clientVersion"];
	visitorData?: string;
}

export interface ClientConfig extends BaseClientConfig {
	originalUrl?: string;
	userAgent?: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36";
}
export type Body<T> = {
	[Property in keyof T]: T[Property];
};

export type RequestBody<T> = Body<T> & {
	context: Context;
};
