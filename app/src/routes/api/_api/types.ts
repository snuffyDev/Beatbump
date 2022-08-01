export interface Client {
	clientName?: "ANDROID" | "WEB_REMIX" | "IOS";
	clientVersion?: "17.13.3" | "1.20220404.01.00" | "16.20";
	utcOffsetMinutes?: number;
	visitorData?: string;
	gl?: string;
	readonly hl?: string;
	originalUrl?: string;
	remoteHost?: string;
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
	captionParams: {};
}

export enum Endpoints {
	Browse = "browse",
	Search = "search",
	Next = "next",
	Player = "player",
}
export interface APIEndpoints {
	readonly home: Endpoints.Browse;
	readonly playlist: Endpoints.Browse;
	readonly search: Endpoints.Search;
	readonly next: Endpoints.Next;
	readonly player: Endpoints.Player;
	readonly artist: Endpoints.Browse;
	readonly related: Endpoints.Browse;
	readonly browse: Endpoints.Browse;
}

export interface BaseClientConfig {
	clientName: "ANDROID" | "WEB_REMIX";
	clientVersion: Client["clientVersion"];
	visitorData?: string;
}

export interface ClientConfig extends BaseClientConfig {
	userAgent?: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36";
	originalUrl?: string;
}
export type Body<T> = {
	[Property in keyof T]: T[Property];
};

export type RequestBody<T> = Body<T> & {
	context: Context;
};
