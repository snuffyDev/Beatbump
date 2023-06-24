import { ItemBuilder } from "$lib/parsers";
import { parseCarousel } from "$lib/parsers/innertube/carousel";
import type { IMusicTwoRowItemRenderer } from "$lib/types/innertube/internals";
import type { RequestHandler } from "@sveltejs/kit";
import { json as json$1 } from "@sveltejs/kit";

/* eslint-disable prefer-const */

export const GET: RequestHandler = async ({ params, fetch, locals, url }) => {
	const { slug } = params;
	// const ctx = query.get('params') || ''
	const itemBuilder = new ItemBuilder({
		proxy: locals.preferences["Proxy Thumbnails"],
		origin: url.origin,
	});

	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/browse?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30&prettyPrint=false`,
		{
			method: "POST",
			keepalive: true,
			body: JSON.stringify({
				context: {
					// clickTracking: { clickTrackingParams: `${itct}` },
					client: {
						clientName: "WEB_REMIX",
						clientVersion: "0.1",
					},

					user: {
						lockedSafetyMode: locals.preferences.Restricted,
					},
				},
				// params: `${ctx}`,
				browseId: `${slug}`,
			}),
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				Origin: "https://music.youtube.com",
			},
		},
	);

	const data = await response.json();
	let {
		header: {
			musicHeaderRenderer: {
				title: { runs: [{ text = "" } = {}] = [] } = {},
			} = {},
		} = {},
		contents: {
			singleColumnBrowseResultsRenderer: {
				tabs: [
					{
						tabRenderer: {
							content: { sectionListRenderer: { contents = [] } = {} } = {},
						} = {},
					} = {},
				] = [],
			} = {},
		} = {},
	} = await data;
	let type: string;

	slug?.includes("videos") ? (type = "videos") : (type = "albums");
	let carousels = [];
	let grids = [];
	let sections = [];
	for (let index = 0; index < contents.length; index++) {
		const element = contents[index];

		element?.musicCarouselShelfRenderer && carousels.push(element);
		element?.gridRenderer && grids.push(element);
	}
	if (carousels.length !== 0) {
		for (let index = 0; index < contents.length; index++) {
			const element = contents[index];
			if (element?.musicCarouselShelfRenderer) {
				sections.push(parseCarousel(element, itemBuilder));
			}
		}
	}
	if (grids.length !== 0) {
		for (let idx = -1; ++idx < contents.length; ) {
			const { gridRenderer = {} } = contents[idx];
			const items = gridRenderer.items;
			const header = gridRenderer.header;
			const section = await Promise.all(
				items.map(
					(ctx: { musicTwoRowItemRenderer: IMusicTwoRowItemRenderer }) =>
						itemBuilder.MusicTwoRowItemRenderer(ctx),
				),
			);
			sections.push({
				section,
				type: "grid",
				title: header?.gridHeaderRenderer?.title?.runs[0]?.text,
			});
		}
	}

	const getTitle = () => {
		const wordParts: Array<any> = slug.split("_");
		for (let i = 0; i < wordParts.length; i++) {
			wordParts[i] = wordParts[i][0].toUpperCase() + wordParts[i].substr(1);
		}
		wordParts.join(" ");
		wordParts.shift();
		return wordParts.join(" ");
	};
	// console.log(sections)
	return json$1({ title: getTitle(), sections, header: text, data });
};
