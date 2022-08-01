import type { RequestHandler } from "@sveltejs/kit";
import { buildRequest } from "./_api/request";

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams;
	const videoId = query.get("videoId") || "";
	const playlistId = query.get("list") || "";
	const playerParams = query.get("playerParams") || "";
	const quality = query.get("quality") || "";
	try {
		const response = await buildRequest("player", {
			context: {
				client: { clientName: "IOS", clientVersion: "17.13.3", hl: "en" },
			},
			params: { videoId, playlistId, params: playerParams },
		});

		if (!response.ok) {
			return { status: response.status, body: response.statusText };
		}
		const data = await response.json();
		if (quality !== "") {
			let res = [...data?.streamingData?.adaptiveFormats].sort((a, b) => {
				const itemA = a.itag;
				const itemB = b.itag;
				if (itemA < itemB) return 1;
				if (itemB < itemA) return -1;
			})[0]?.url;

			return {
				status: 200,
				body: res,
			};
		}
		return {
			status: 200,
			body: data,
		};
	} catch (error) {
		console.error(error);
		return {
			status: 500,
			error: new Error(error.message),
		};
	}
};
