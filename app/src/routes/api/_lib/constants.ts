import { Endpoints, type APIEndpoints, type Context } from "./types";

const API_BASE_URL = "https://music.youtube.com/youtubei/v1/";
const API_ORIGIN = "https://music.youtube.com";

const USER_AGENT =
	"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";

const WEB_REMIX_KEY = "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30";
const ANDROID_KEY = "AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w";

const ENDPOINT_NAMES: APIEndpoints = {
	playlist: Endpoints.Browse,
	search: Endpoints.Search,
	next: Endpoints.Next,
	home: Endpoints.Browse,
	player: Endpoints.Player,
	artist: Endpoints.Browse,
	related: Endpoints.Browse,
	browse: Endpoints.Browse,
} as const;

const CONTEXT_DEFAULTS: Pick<Context, "client" | "user" | "request" | "captionParams"> = {
	client: {
		hl: "en",
		utcOffsetMinutes: -new Date().getTimezoneOffset(),
	},
	request: {
		useSsl: true,
	},
	user: {
		lockedSafetyMode: false,
	},
	captionParams: {},
};

export { ANDROID_KEY, API_BASE_URL, API_ORIGIN, CONTEXT_DEFAULTS, ENDPOINT_NAMES, USER_AGENT, WEB_REMIX_KEY };
