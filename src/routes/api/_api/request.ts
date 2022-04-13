import type { Body, APIEndpoints, Context } from "./types";
import { Endpoints } from "./types";
// import fetch from "node-fetch";
const API_BASE_URL = "https://music.youtube.com/youtubei/v1/";
const API_ORIGIN = "https://music.youtube.com";

const USER_AGENT =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36";

const WEB_REMIX_KEY = "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30";
const ANDROID_KEY = "AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w";

const ENDPOINT_NAMES: APIEndpoints = {
	playlist: Endpoints.Browse,
	search: Endpoints.Search,
	next: Endpoints.Next,
	player: Endpoints.Player,
	artist: Endpoints.Browse
} as const;

const CONTEXT_DEFAULTS: Pick<
	Context,
	"client" | "user" | "request" | "captionParams"
> = {
	client: {
		hl: "en",
		utcOffsetMinutes: -new Date().getTimezoneOffset()
	},
	request: {
		useSsl: true
	},
	user: {
		lockedSafetyMode: false
	},
	captionParams: {}
};

function buildRequestBody<T>(context: Context, params: Body<T>) {
	return { context, ...params };
}

export function buildRequest<T>({
	endpoint,
	context,
	params
}: {
	endpoint: keyof APIEndpoints;
	context: Partial<Context>;
	params: T;
}): Promise<Response> {
	const ctx = { ...CONTEXT_DEFAULTS, ...context };
	const body = params as unknown;

	switch (endpoint) {
		case "artist":
			return artistRequest(ctx, body as ArtistEndpointParams);
			break;
		case "next":
			// TODO!
			break;
		case "player":
			return playerRequest(ctx, body as PlayerEndpointParams);
			break;
		case "playlist":
			// TODO!
			break;
		case "search":
			// TODO!
			break;
		default:
			break;
	}
}

function browseRequest<T extends PlaylistEndpointParams<T>>(
	context: Context,
	params: T
);
function browseRequest<T extends ArtistEndpointParams>(
	context: Context,
	params: T
);
function browseRequest<T>(context: Context, params: T) {
	const body = buildRequestBody(context as Context, params);
	// params
	const request = fetch(
		API_BASE_URL + Endpoints.Browse + `?key=${WEB_REMIX_KEY}`,
		{
			headers: {
				Host: "music.youtube.com",
				"User-Agent": USER_AGENT,
				"Content-Type": "application/json",
				"x-origin": "https://music.youtube.com",
				"x-goog-visitor-id": encodeURIComponent(
					context["client"]["visitorData"]
				),

				Origin: "https://music.youtube.com"
			},
			body: JSON.stringify(body),
			method: "POST"
		}
	);
	return request;
}

function playerRequest<T extends PlayerEndpointParams>(
	context: Context,
	params: T
) {
	const body = buildRequestBody(context as Context, params);
	// console.log(
	// 	body,
	// 	API_BASE_URL + ENDPOINT_NAMES.player + `?key=${ANDROID_KEY}`
	// );
	const request = fetch(
		API_BASE_URL + ENDPOINT_NAMES.player + `?key=${ANDROID_KEY}`,
		{
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				Origin: API_ORIGIN
			},
			body: JSON.stringify(body),
			method: "POST"
		}
	);
	return request;
}

function artistRequest<T extends ArtistEndpointParams>(
	context: Context,
	body: T
) {
	const reqBody = buildRequestBody(context as Context, body);

	const request = fetch(
		API_BASE_URL + ENDPOINT_NAMES.artist + `?key=${WEB_REMIX_KEY}`,
		{
			headers: {
				Origin: API_ORIGIN,
				"x-origin": API_ORIGIN,
				"User-Agent": USER_AGENT
			},
			method: "POST",
			body: JSON.stringify(reqBody)
		}
	);
	return request;
}
