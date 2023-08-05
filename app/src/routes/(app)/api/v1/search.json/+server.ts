import { ItemBuilder } from "$lib/parsers";
import type { NextContinuationData } from "$lib/types";
import type { SearchFilter } from "$lib/types/api/search";
import type { IMusicResponsiveListItemRenderer } from "$lib/types/innertube/internals";
import type { MusicShelf } from "$lib/types/musicShelf";
import { iter } from "$lib/utils";
import { filterMapAsync, type Maybe } from "$lib/utils/collections/array";
import { error, json } from "@sveltejs/kit";
import type { SearchEndpointParams } from "../../_lib/_base";
import { buildAPIRequest } from "../../_lib/request";
import { parseParams } from "../../_lib/utils";

type DeepPartial<T> = {
	[Key in keyof T]?: Exclude<T[Key], undefined | null> extends Record<
		string,
		unknown
	>
		? DeepPartial<T[Key]>
		: T[Key];
};

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

export type SearchSchema = {
	ctoken?: string;
	itct?: string;
	filter: SearchFilter;
	q: string;
};

const parser = parseParams<SearchSchema>(["ctoken", "filter", "itct", "q"]);

export const GET = async ({ url, locals }) => {
	const queryParam = url.searchParams;
	const { Restricted: restricted, "Proxy Thumbnails": proxy } =
		locals.preferences;

	const { q, filter, ctoken, itct } = parser(queryParam.entries());
	const itemBuilder = new ItemBuilder({ proxy, origin: url.origin });
	const rawFilterParam = Filters[filter] ?? undefined;

	try {
		const response = await buildAPIRequest<SearchEndpointParams>("search", {
			context: {
				client: {
					clientName: "WEB_REMIX",
					clientVersion: "1.20230501.01.00",
				},
				user: { lockedSafetyMode: !!restricted },
			},
			params: {
				browseId: "",
				query: decodeURIComponent(q),
				params: filter !== "all" ? `${rawFilterParam}` : undefined,
			},
			headers: null,
			continuation:
				ctoken !== null
					? { continuation: ctoken, ctoken, itct: `${itct}`, type: "next" }
					: {},
		}).then((r) => {
			if (!r) throw Error("Failed to send the search request"); // No response returned
			if (!r.ok) throw Error(r.statusText); // Response status code >= 400

			return r.json();
		});

		const contents =
			response?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer
				?.content?.sectionListRenderer?.contents;
		const continuationContents =
			response?.continuationContents?.musicShelfContinuation;

		const results = ctoken
			? await parseContinuation(continuationContents, filter, itemBuilder)
			: await parseContents(contents, itemBuilder);

		return json({ ...results, response });
	} catch (err) {
		console.error(err);
		throw error(500, (err as Error).message);
	}
};

async function parseContinuation(
	contents: Record<string, unknown> | undefined,
	filter: SearchFilter,
	itemBuilder: ItemBuilder,
) {
	const continuation: Maybe<Partial<NextContinuationData>> =
		Array.isArray(contents?.continuations) &&
		contents?.continuations[0]?.nextContinuationData;

	const type = filter.includes("playlists") ? "playlists" : filter;

	if (typeof contents !== "object")
		return {
			continuation,
			results: [],
			type: "next",
		};

	const results = await parseResults(
		(contents?.contents as unknown[]) || [],
		type,
		itemBuilder,
	);

	return {
		continuation,
		results,
		type: "next",
	};
}

async function parseContents(
	contents:
		| Array<{
				itemSectionRenderer?: unknown;
				musicShelfContinuation?: Record<string, unknown>;
				musicCardShelfRenderer?: Record<string, unknown>;
				musicShelfRenderer?: {
					continuations?: [{ nextContinuationData: NextContinuationData }];
					contents?: {
						musicResponsiveListItemRenderer: IMusicResponsiveListItemRenderer;
					}[];
					title?: { runs: [{ text: string }] };
				};
		  }>
		| undefined,
	itemBuilder: ItemBuilder,
) {
	const continuation: Maybe<Partial<NextContinuationData>> = {};

	const results = await filterMapAsync(
		contents ?? [],
		async (section) => {
			if (section && section.itemSectionRenderer) {
				return null;
			}

			const musicShelf = section.musicShelfRenderer;

			if (musicShelf) {
				const items = musicShelf?.contents;

				if (Array.isArray(musicShelf?.continuations)) {
					Object.assign(
						continuation,
						musicShelf.continuations[0]?.nextContinuationData,
					);
				}

				const shelf: DeepPartial<MusicShelf> = {
					contents: [],
					header: { title: musicShelf?.title?.runs?.[0]?.text ?? "" },
				};

				if (items) {
					const _results = await parseResults(
						items,
						shelf.header?.title?.toLowerCase().replace(/\s/gm, "_") as string,
						itemBuilder,
					);
					shelf.contents = _results;
				}

				return shelf;
			} else {
				const musicCardShelfRenderer = section.musicCardShelfRenderer;
				const item: { buttons?: Record<string, unknown> } = {};
				item.buttons = musicCardShelfRenderer?.buttons;
			}

			return null;
		},
		Boolean,
	);

	return {
		results,
		continuation,
	};
}

async function parseResults(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	items: Array<any> | undefined,
	type: string,
	itemBuilder: ItemBuilder,
) {
	if (!items) {
		return [];
	}

	return Promise.all(
		items.map(async (entry) => {
			const item = await itemBuilder.MusicResponsiveListItemRenderer(entry);
			const normalizedType =
				type === "top_result" &&
				item?.endpoint?.pageType?.match(/SINGLE|ALBUM/i)
					? "albums"
					: type;

			Object.assign(item, {
				type: normalizedType,
			});

			if (normalizedType.includes("playlists") || normalizedType === "albums") {
				let metaData = "";
				iter(item.subtitle, (subtitle) => (metaData += subtitle?.text));

				Object.assign(item, {
					metaData,
					browseId:
						entry?.musicResponsiveListItemRenderer?.navigationEndpoint
							?.browseEndpoint?.browseId,
					playlistId:
						entry?.musicResponsiveListItemRenderer?.menu?.menuRenderer
							?.items?.[0]?.menuNavigationItemRenderer?.navigationEndpoint
							?.watchPlaylistEndpoint?.playlistId,
				});
			}

			if (type === "songs") {
				Object.assign(item, {
					album:
						item.subtitle?.at?.(-3)?.pageType?.includes("ALBUM") &&
						item.subtitle.at(-3),
				});
			}

			return item;
		}),
	);
}
