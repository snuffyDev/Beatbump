import type {
	BaseClientConfig,
	Body,
	ClientConfig,
	RequestBody,
	Client,
	ClickTracking,
	APIEndpoints,
	Context
} from "./types";
import { Endpoints } from "./types";

const API_BASE_URL = "https://music.youtube.com/youtubei/v1/";
const API_ORIGIN = "https://music.youtube.com";

const USER_AGENT =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36";

const WEB_REMIX_KEY = "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30";

const ENDPOINT_NAMES: APIEndpoints = {
	playlist: Endpoints.Browse,
	search: Endpoints.Search,
	next: Endpoints.Next,
	player: Endpoints.Player,
	artist: Endpoints.Browse
} as const;

const CONTEXT_DEFAULTS: Pick<Context, "client" | "user" | "request"> = {
	client: {
		hl: "en",
		utcOffsetMinutes: -new Date().getTimezoneOffset(),
		userAgent: USER_AGENT
	},
	request: {
		useSsl: true
	},
	user: {
		lockedSafetyMode: false
	}
};

function buildContext(ctxParams: Partial<Context>) {
	// const client = Object.assign({}, CONTEXT_DEFAULTS.client,ctxParams.client)
	return Object.assign({}, CONTEXT_DEFAULTS, ctxParams);
}

function buildRequestBody<T>(
	context: Context,
	params: Body<T>
): RequestBody<T> {
	return Object.assign(
		{
			context
		},
		params
	);
}

export function buildRequest<T>({
	endpoint,
	context,
	params
}: {
	endpoint: keyof APIEndpoints;
	context: Partial<Context>;
	params: T;
}): unknown {
	const ctx = buildContext(context);
	const body = params as unknown;

	switch (endpoint) {
		case "artist":
			return artistRequest(ctx, body as ArtistEndpointParams);
			break;
		case "next":
			// TODO!
			break;
		case "player":
			// TODO!
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
	return { context, body };
}

function artistRequest<T extends ArtistEndpointParams>(
	context: Context,
	body: T
) {
	const reqBody = buildRequestBody(context as Context, body);

	return fetch(API_BASE_URL + ENDPOINT_NAMES.artist + `?key=${WEB_REMIX_KEY}`, {
		headers: {
			Origin: API_ORIGIN,
			"x-origin": API_ORIGIN,
			"User-Agent": USER_AGENT
		},
		method: "POST",
		body: JSON.stringify(reqBody)
	});
}
