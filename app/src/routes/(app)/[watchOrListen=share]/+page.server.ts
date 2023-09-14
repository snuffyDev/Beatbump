import { redirect } from "@sveltejs/kit";
export const load = async ({ url, fetch }) => {
	const id = url.searchParams.get("id") ?? url.searchParams.get("videoId");
	const playlist = url.searchParams.get("list") || undefined;

	if (!id) {
		throw redirect(301, "/trending");
	}

	const [data, list] = await Promise.all([
		fetch(
			`/api/v1/player.json?videoId=${id ? id : ""}${
				playlist ? `&playlistId=${playlist}` : ""
			}`,
		).then((res) => res.json()),
		fetch(
			`/api/v1/next.json?videoId=${id ? id : ""}${
				playlist ? `&playlistId=${playlist}` : ""
			}`,
		).then((res) => res.json()),
	]);

	const {
		videoDetails: {
			title = "",
			videoId = "",
			thumbnail: { thumbnails = [] } = {},
		} = {},
	} = data;

	return {
		title,
		thumbnails,
		videoId,
		playlist,
		related: list,
		data,
	};
};
