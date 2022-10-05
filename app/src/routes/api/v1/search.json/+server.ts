import { error, json } from "@sveltejs/kit";
import { MusicResponsiveListItemRenderer } from "$lib/parsers";
import { iter, type Maybe } from "$lib/utils";
import { buildRequest } from "$api/request";
import type { Item, NextContinuationData } from "$lib/types";
import type { IMusicResponsiveListItemRenderer } from "$lib/types/internals";
import type { RequestHandler } from "./$types";
import type { SearchEndpointParams } from "$api/_base";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import type { MusicShelf } from "$lib/types/musicShelf";
import type { SearchFilter } from "$lib/types/api/search";

const Filters = {
	all: "",
	songs: "EgWKAQIIAWoKEAMQBBAJEAoQBQ%3D%3D",
	videos: "EgWKAQIQAWoKEAMQBBAJEAoQBQ%3D%3D",
	albums: "EgWKAQIYAWoKEAMQBBAJEAoQBQ%3D%3D",
	artists: "EgWKAQIgAWoKEAMQBBAJEAoQBQ%3D%3D",
	community_playlists: "EgeKAQQoAEABagwQDhAKEAkQAxAEEAU%3D",
	featured_playlists: "EgeKAQQoADgBagwQDhAKEAMQBBAJEAU%3D",
	all_playlists: "EgWKAQIoAWoKEAMQBBAKEAUQCQ%3D%3D",
} as const;

export const GET: RequestHandler = async ({ url }) => {
	const queryParam = url.searchParams;
	const q = queryParam.get("q") ?? "";
	const filter: SearchFilter | string = (queryParam.get("filter") as SearchFilter) ?? undefined;

	const ctoken = queryParam.get("ctoken") ?? "";
	const itct = queryParam.get("itct") ?? "";

	const rawFilterParam = Filters[filter] ?? undefined;
	try {
		const response = await buildRequest<SearchEndpointParams>("search", {
			context: {
				client: {
					clientName: "WEB_REMIX",
					clientVersion: "1.20220404.01.00",
				},
			},
			params: {
				browseId: "",
				query: decodeURIComponent(q),
				params: filter !== "all" ? `${rawFilterParam}` : undefined,
			},
			continuation: ctoken !== "" ? { continuation: ctoken, ctoken, itct: `${itct}`, type: "next" } : undefined,
		});
		if (!response.ok) {
			throw error(500, response.statusText);
		}
		const data = await response.json();

		const hasTabs = Array.isArray(data?.contents?.tabbedSearchResultsRenderer?.tabs);

		const contents =
			hasTabs && data.contents.tabbedSearchResultsRenderer.tabs[0].tabRenderer?.content?.sectionListRenderer?.contents;
		const continuationContents = data?.continuationContents?.musicShelfContinuation;

		const results =
			ctoken !== ""
				? parseContinuation(continuationContents, filter as SearchFilter)
				: parseContents(contents, filter as SearchFilter);

		return json(Object.assign(results, { data }));
	} catch (err) {
		throw error(500, err);
	}
};

function parseContinuation(contents: Record<string, any>, filter: string & SearchFilter) {
	const continuation: Maybe<Partial<NextContinuationData>> =
		Array.isArray(contents?.continuations) && contents?.continuations[0]?.nextContinuationData;
	const type = filter.includes("playlists") ? "playlists" : filter;

	const results = parseResults(contents.contents, type);

	return {
		continuation,
		results,
		type: "next",
	};
}

function parseContents(
	contents: {
		itemSectionRenderer?: unknown;
		musicShelfContinuation: Record<string, any>;
		musicShelfRenderer?: {
			continuations?: [{ nextContinuationData: NextContinuationData }];
			contents?: { musicResponsiveListItemRenderer: IMusicResponsiveListItemRenderer }[];

			title?: { runs: [{ text: string }] };
		};
	}[] = [],
	filter: SearchFilter,
) {
	const results: MusicShelf[] = [];
	const continuation: Maybe<Partial<NextContinuationData>> = {};

	let len = contents.length;
	const type = filter.includes("playlists") ? "playlists" : filter;
	while (--len > -1) {
		const shelf: MusicShelf = { contents: [], header: { title: "" } };
		const section = contents[len];

		/// PR: https://github.com/snuffyDev/Beatbump/pull/83
		if (section && section.itemSectionRenderer) {
			continue;
		}
		const musicShelf = section.musicShelfRenderer;
		// Get the inner contents
		const items = Array.isArray(musicShelf.contents) && musicShelf.contents;

		// Gets the continuation tokens
		if (Array.isArray(musicShelf?.continuations) && musicShelf?.continuations[0].nextContinuationData)
			Object.assign(continuation, musicShelf.continuations[0].nextContinuationData);

		// If the section has an array at the property `contents` - parse it.
		if (items) {
			const _results = parseResults(items, type);
			shelf.contents = _results;
		}
		if (musicShelf.title) {
			shelf.header.title = musicShelf.title?.runs[0]?.text;
		}
		results.unshift(shelf);
	}
	return { results, continuation };
}

function parseResults(items: any[], type: string) {
	const results: IListItemRenderer[] = [];
	let idx = items.length;
	while (--idx > -1) {
		const entry = items[idx];
		const item = MusicResponsiveListItemRenderer(entry);
		Object.assign(item, { type: type });
		if (type === "playlists" || type === "albums") {
			let metaData = "";
			iter(item.subtitle, (subtitle) => (metaData += subtitle.text));
			Object.assign(item, {
				metaData: metaData,
				browseId: entry.musicResponsiveListItemRenderer?.navigationEndpoint?.browseEndpoint?.browseId,
				playlistId:
					entry.musicResponsiveListItemRenderer.menu?.menuRenderer?.items[0]?.menuNavigationItemRenderer
						?.navigationEndpoint?.watchPlaylistEndpoint?.playlistId,
			});
		}
		if (type === "songs") {
			Object.assign(item, {
				album: item.subtitle.at(-3).pageType?.includes("ALBUM") && item.subtitle.at(-3),
			});
		}
		results.unshift(item);
	}
	return results;
}
