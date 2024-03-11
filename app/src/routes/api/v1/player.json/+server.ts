import type { RequestHandler } from "@sveltejs/kit";
import { buildAPIRequest } from "$api/request";
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
		const response = await buildAPIRequest("player", {
			context: {
				client: { clientName: "IOS", clientVersion: "18.11.34", hl: "en" },
			},
			params: { videoId, playlistId, params: playerParams, racyCheckOk: true, contentCheckOk: true },
		});

		if (!response.ok) {
			throw error(response.status, response.statusText);
		}
		const data = await response.json();

		return json(data);
	} catch (err) {
		console.error(err);
		throw error(500, err);
	}
};
