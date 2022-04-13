import type { RequestHandler } from "@sveltejs/kit";
import { buildRequest } from "./_api/request";

export const get: RequestHandler = async ({ url }) => {
	const query = url.searchParams;
	const videoId = query.get("videoId") || "";
	const playlistId = query.get("list") || "";
	const playerParams = query.get("playerParams") || "";
	try {
		const response = await buildRequest({
			endpoint: "player",
			context: {
				client: { clientName: "ANDROID", clientVersion: "17.13.3", hl: "en" }
			},
			params: { videoId, playlistId, params: playerParams }
		});

		if (!response.ok) {
			return { status: response.status, body: response.statusText };
		}
		const data = await response.json();
		return {
			status: 200,
			body: data
		};
	} catch (error) {
		console.error(error);
		return {
			status: 500,
			error: new Error(error.message)
		};
	}
};
