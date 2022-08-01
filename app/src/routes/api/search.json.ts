import { MusicResponsiveListItemRenderer } from "$lib/parsers";
import { iter } from "$lib/utils";
import { buildRequest } from "./_api/request";
import type { NextContinuationData } from "$lib/types";
import type { IMusicResponsiveListItemRenderer } from "$lib/types/internals";
import type { RequestHandler } from "@sveltejs/kit";
import type { SearchEndpointParams } from "./_api/_base";

export type SearchFilter = "video" | "community_playlist" | "featured_playlist" | "all_playlist" | "song" | "artist";

const Filters = {
	song: "EgWKAQIIAWoKEAMQBBAJEAoQBQ%3D%3D",
	video: "EgWKAQIQAWoKEAMQBBAJEAoQBQ%3D%3D",
	album: "EgWKAQIYAWoKEAMQBBAJEAoQBQ%3D%3D",
	artist: "EgWKAQIgAWoKEAMQBBAJEAoQBQ%3D%3D",
	community_playlist: "EgeKAQQoAEABagwQDhAKEAkQAxAEEAU%3D",
	featured_playlist: "EgeKAQQoADgBagwQDhAKEAMQBBAJEAU%3D",
	all_playlists: "EgWKAQIoAWoKEAMQBBAKEAUQCQ%3D%3D",
} as const;

export const GET: RequestHandler = async ({ url }) => {
	const queryParam = url.searchParams;
	const q = queryParam.get("q") || "";
	const filter: SearchFilter | string = (queryParam.get("filter") as SearchFilter) || "";

	const ctoken = queryParam.get("ctoken") || "";
	const itct = queryParam.get("itct") || "";

	const rawFilterParam = Filters[filter] ?? Filters.song;
	try {
		const response = await buildRequest<SearchEndpointParams>("search", {
			context: {
				client: {
					clientName: "WEB_REMIX",
					clientVersion: "1.20220404.01.00",
				},
			},
			params: { browseId: "", query: decodeURIComponent(q), params: filter !== "" ? `${rawFilterParam}` : "" },
			continuation: ctoken !== "" ? { continuation: ctoken, ctoken, itct: `${itct}`, type: "next" } : null,
		});
		if (!response.ok) {
			return {
				status: response.status,
				body: response.statusText,
			};
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

		return {
			status: 200,
			body: results,
		};
	} catch (err) {
		return {
			status: 500,
			body: err,
		};
	}
};

function parseContinuation(contents: Record<string, any>, filter: string & SearchFilter) {
	const continuation = Array.isArray(contents?.continuations) && contents?.continuations[0]?.nextContinuationData;
	const type = filter.includes("playlist") ? "playlist" : filter;

	const results = parseResults(contents.contents, type);

	return {
		continuation,
		results,
	};
}

function parseContents(
	contents: {
		itemSectionRenderer?: unknown;
		musicShelfContinuation: Record<string, any>;
		musicShelfRenderer?: {
			continuations?: [{ nextContinuationData: NextContinuationData }];
			contents?: { musicResponsiveListItemRenderer: IMusicResponsiveListItemRenderer }[];
		};
	}[] = [],
	filter: SearchFilter,
) {
	const results = [];

	let len = contents.length;
	const type = filter.includes("playlist") ? "playlist" : filter;
	const continuation = {};
	while (--len > -1) {
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
			Object.assign(results, _results);
		}
	}
	return { results, continuation };
}

function parseResults(items: any[], type: string) {
	const results = [];
	let idx = items.length;
	while (--idx > -1) {
		const entry = items[idx];
		const item = MusicResponsiveListItemRenderer(entry);
		Object.assign(item, { type: type });
		if (type === "playlist") {
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
		if (type === "song") {
			Object.assign(item, {
				album: item.subtitle.at(-3).pageType && item.subtitle.at(-3).pageType.includes("ALBUM") && item.subtitle.at(-3),
			});
		}
		results.unshift(item);
	}
	return results;
}
