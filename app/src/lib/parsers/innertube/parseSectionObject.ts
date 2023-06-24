import type { IMusicTwoRowItemRenderer } from "$lib/types/innertube/internals";
import type {
	MusicCarouselShelfBasicHeaderRenderer,
	MusicCarouselShelfRenderer,
} from "$lib/types/innertube/musicCarouselShelfRenderer";
import { MusicTwoRowItemRenderer } from "../items";

export type GridOrCarousel<T extends "grid" | "carousel"> = T extends "grid"
	? {
			gridRenderer: Omit<MusicCarouselShelfRenderer, "contents" | "header"> & {
				items: MusicCarouselShelfRenderer["contents"];
				header: { gridHeaderRenderer: MusicCarouselShelfBasicHeaderRenderer };
			};
	  }
	: { musicCarouselShelfRenderer: MusicCarouselShelfRenderer };

export const parseGridRendererSection = async ({
	gridRenderer,
}: GridOrCarousel<"grid">) => {
	const { items: contents = [], header } = gridRenderer;
	const items = await Promise.all(
		contents.map((ctx) =>
			MusicTwoRowItemRenderer(
				ctx as { musicTwoRowItemRenderer: IMusicTwoRowItemRenderer },
			),
		),
	);
	return {
		items,
		header: { title: header?.gridHeaderRenderer?.title?.runs[0]?.text },
		type: "grid",
	} as const;
};

export { parseCarousel as parseCarouselItem } from "./carousel";
