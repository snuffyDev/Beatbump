import type { RequestHandler } from "@sveltejs/kit";
import { buildRequest } from "$api/request";
import { error, json } from "@sveltejs/kit";

/**
 * @root "/api/v1/"
 * @description Will return the player data for the provided videoId.\nThe stream URLs can be found in the streamingData object in the JSON response.
 * @endpoint player.json
 * @method GET
 * @returns {PlayerAPIResponse}
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	const query = url.searchParams;

	const videoId = query.get("videoId") || "";
	const playlistId = query.get("list") || "";
	const playerParams = query.get("playerParams") || "";
	try {
		const response = await buildRequest("player", {
			context: {
				client: { clientName: "IOS", clientVersion: "17.13.3", hl: "en" },
			},
			params: { videoId, playlistId, params: playerParams, racyCheckOk: true, contentCheckOk: true },
		});

		if (!response.ok) {
			// Suggestion (check for correctness before using):
			// return new Response(response.statusText, { status: response.status });
			return error(response.status, response.statusText);
		}
		const data = await response.json();

		return json(data);
	} catch (error) {
		console.error(error);
		return new Response(undefined, { status: 500 });
	}
};
