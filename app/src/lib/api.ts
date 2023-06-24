import type { GetQueueSchema } from "../routes/(app)/api/v1/get_queue.json/+server";
import type {
	NextEndpointResponse,
	NextSchema,
} from "../routes/(app)/api/v1/next.json/+server";
import type { PlayerSchema } from "../routes/(app)/api/v1/player.json/+server";
import type {
	PlaylistResponseBody,
	PlaylistSchema,
} from "../routes/(app)/api/v1/playlist.json/+server";
import type { RelatedEndpointResponse } from "../routes/(app)/api/v1/related.json/+server";
import type { SearchSchema } from "../routes/(app)/api/v1/search.json/+server";
import type { SearchResponse } from "../routes/(app)/search/[slug]/proxy+page";
import type { Song } from "./types";
import { queryParams } from "./utils";

type RequestConfig = {
	restricted?: boolean;
	proxy_thumbnails?: boolean;
};

type ApiResponse<T> = Promise<T | null>;

const API_ROUTES = {
	get_queue: "/api/v1/get_queue.json",
	get_search_suggestions: "/api/v1/get_search_suggestions.json",
	main: "/api/v1/main.json",
	next: "/api/v1/next.json",
	player: "/api/v1/player.json",
	playlist: "/api/v1/playlist.json",
	related: "/api/v1/related.json",
	search: "/api/v1/search.json",
	stats: "/api/v1/stats.json",
} as const;

const sendRequest = <T>(
	route: keyof typeof API_ROUTES,
	params?: Record<string, string | boolean>,
	options?: RequestConfig,
): ApiResponse<T> => {
	const url = `${API_ROUTES[route]}${
		params ? `?${queryParams({ ...params, ...options })}` : ""
	}`;
	return fetch(url, {
		headers: { accept: "application/json" },
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error(`Request failed with status ${response.status}`);
			}
			return response.json() as Promise<T>;
		})
		.catch((err) => {
			console.error(err);
			return null;
		});
};

export const APIClient = {
	getQueue: (
		params?: GetQueueSchema,
		options?: RequestConfig,
	): ApiResponse<Song[]> => {
		return sendRequest<Song[]>("get_queue", params, options);
	},
	getSearchSuggestions: (
		params?: SearchSchema,
		options?: RequestConfig,
	): ApiResponse<unknown> => {
		return sendRequest<unknown>("get_search_suggestions", params, options);
	},
	main: (
		params?: Record<string, string>,
		options?: RequestConfig,
	): ApiResponse<Record<string, unknown>> => {
		return sendRequest<Record<string, unknown>>("main", params, options);
	},
	next: (
		params: NextSchema,
		options?: RequestConfig,
	): ApiResponse<NextEndpointResponse> => {
		return sendRequest<NextEndpointResponse>("next", params, options);
	},
	player: (
		params: PlayerSchema,
		options?: RequestConfig,
	): ApiResponse<Record<string, unknown>> => {
		return sendRequest<Record<string, unknown>>("player", params, options);
	},
	playlist: (
		params?: PlaylistSchema,
		options?: RequestConfig,
	): ApiResponse<PlaylistResponseBody> => {
		return sendRequest<PlaylistResponseBody>("playlist", params, options);
	},
	related: (
		params?: { browseId: string },
		options?: RequestConfig,
	): ApiResponse<RelatedEndpointResponse> => {
		return sendRequest<RelatedEndpointResponse>("related", params, options);
	},
	search: (
		params: SearchSchema,
		options?: RequestConfig,
	): ApiResponse<SearchResponse> => {
		return sendRequest<SearchResponse>("search", params, options);
	},
};
