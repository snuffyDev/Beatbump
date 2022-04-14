import { queryParams } from "$lib/utils";
import {
	CONTEXT_DEFAULTS,
	API_BASE_URL,
	WEB_REMIX_KEY,
	USER_AGENT,
	ENDPOINT_NAMES,
	ANDROID_KEY,
	API_ORIGIN
} from "./constants";
import type { Body, APIEndpoints, Context } from "./types";
import { Endpoints } from "./types";
import type {
	ArtistEndpointParams,
	PlayerEndpointParams,
	PlaylistEndpointParams,
	NextEndpointParams,
	PlaylistEndpointContinuation
} from "./_base";

type Nullable<T> = T | null;
type IHeaders = Record<string, string>;

/** Helper function to build a request body
		consisting of Context and params of type `T` */
function buildRequestBody<T>(context: Context, params: Body<T>) {
	return { context, ...params };
}

/**
 * Builds a YouTube Music API request.
 * @param endpoint
 * @param options
 * @returns {Promise<Response>} A promise consisting of a Response
 */
export function buildRequest<T>(
	endpoint: keyof APIEndpoints,
	{
		context,
		params,
		continuation,
		headers = {}
	}: {
		context: Partial<Context>;
		params: T;
		continuation?: Nullable<PlaylistEndpointContinuation>;
		headers?: IHeaders;
	}
): Promise<Response> {
	const ctx = { ...CONTEXT_DEFAULTS, ...context };
	const body = params as unknown;

	switch (endpoint) {
		case "artist":
			return artistRequest(ctx, body as ArtistEndpointParams);
		case "next":
			// TODO!
			break;
		case "player":
			return playerRequest(ctx, body as PlayerEndpointParams);
		case "playlist":
			return browseRequest(
				ctx,
				body as PlaylistEndpointParams,
				continuation,
				headers
			);
		case "home":
			return browseRequest(
				ctx,
				body as PlaylistEndpointParams,
				continuation,
				headers
			);
		case "search":
			// TODO!
			break;
		default:
			break;
	}
}

function nextRequest<T extends NextEndpointParams>(
	context: Context,
	params: T,
	continuation?: Nullable<NextEndpointParams>,
	headers?: IHeaders
) {
	//
}

function browseRequest<T extends PlaylistEndpointParams>(
	context: Context,
	params: T,
	continuation?: Nullable<PlaylistEndpointContinuation>,
	headers?: IHeaders
);
function browseRequest<T extends ArtistEndpointParams>(
	context: Context,
	params: T,
	continuation?: Nullable<PlaylistEndpointContinuation>,
	headers?: IHeaders
);
function browseRequest<T>(
	context: Context,
	params: T,
	continuation?: Nullable<PlaylistEndpointContinuation>,
	headers: IHeaders = {}
) {
	const body = buildRequestBody(context as Context, params);

	// if continuation is defined, querystringify it
	const request = fetch(
		API_BASE_URL +
			Endpoints.Browse +
			"?" +
			(continuation ? queryParams(continuation) + "&" : "") +
			`key=${WEB_REMIX_KEY}`,
		{
			headers: Object.assign(
				{
					Host: "music.youtube.com",
					"User-Agent": USER_AGENT,
					"Content-Type": "application/json; charset=utf-8",
					"x-origin": "https://music.youtube.com",
					"x-goog-visitor-id": context["client"]["visitorData"] || "",
					Origin: "https://music.youtube.com"
				},
				headers
			),
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
