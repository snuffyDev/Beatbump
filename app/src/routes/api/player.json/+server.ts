import type { RequestHandler } from "@sveltejs/kit";
import { buildRequest } from "../_api/request";

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
			params: { videoId, playlistId, params: playerParams },
		});

		if (!response.ok) {
			throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
			// Suggestion (check for correctness before using):
			// return new Response(response.statusText, { status: response.status });
			return { status: response.status, body: response.statusText };
		}
		const data = await response.json();

		return new Response(JSON.stringify(data));
	} catch (error) {
		console.error(error);
		return new Response(undefined, { status: 500 });
	}
};
