import { buildRequest } from "$api/request";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams;
	const browseId = query.get("browseId");
	const response = await buildRequest("browse", {
		context: { client: { clientName: "WEB_REMIX", clientVersion: "1.20220404.01.00" } },
		params: { browseId: browseId },
	});

	const data = await response.json();

	const contents =
		data.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents;
	let sections = [];
	for (let index = 0; index < contents.length; index++) {
		const { gridRenderer } = contents[index];
		const { items = [], header = {} } = gridRenderer;

		for (let i = 0; i < items.length; i++) {
			const item = items[i]?.musicNavigationButtonRenderer;
			items[i] = {
				text: item?.buttonText?.runs[0]?.text,
				color: `#${("00000000" + (item?.solid?.leftStripeColor & 0xffffff).toString(16)).slice(-6)}`,
				endpoint: {
					params: item?.clickCommand?.browseEndpoint?.params,
					browseId: item?.clickCommand?.browseEndpoint?.browseId,
				},
			};
		}
		sections = [
			...sections,
			{
				section: [...items],
				title: header?.gridHeaderRenderer?.title?.runs[0]?.text,
			},
		];
	}

	return new Response(JSON.stringify(sections));
};
