import { buildAPIRequest } from "$api/request";
import { parseParams } from "$api/utils";
import type { RequestHandler } from "@sveltejs/kit";
import { error, json } from "@sveltejs/kit";

type PlayerSchema = {
	videoId?: string;
	playlistId?: string;
	playerParams?: string;
};

const parser = parseParams<PlayerSchema>(["playerParams", "playlistId", "videoId"]);

/**
 * @root "/api/v1/"
 * @description Will return the player data for the provided videoId.\nThe stream URLs can be found in the streamingData object in the JSON response.
 * @endpoint player.json
 * @method GET
 * @returns {PlayerAPIResponse}
 */
export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams;

	const { videoId, playlistId, playerParams } = parser(query.entries());

	try {
		const response = await buildAPIRequest("player", {
			context: {
				client: { clientName: "IOS", clientVersion: "17.13.3", hl: "en" },
			},
			headers: {},
			params: {
				videoId,
				playlistId,
				params: playerParams,
				racyCheckOk: true,
				contentCheckOk: true,
			},
		}).then((res) => {
			if (!res) throw Error("Failed to fetch endpoint");
			if (!res.ok) throw Error(res.statusText);
			return res.json();
		});

		return json(response);
	} catch (err) {
		console.error(err);
		throw error(500, err as string);
	}
};
