import type { CarouselHeader, Item, NavigationEndpoint } from "$lib/types";

export type sections = [
	{
		type: string;
		header?: CarouselHeader;
		results?: Item[];
		section: [
			{
				type: string;
				thumbnail: string;
				title: string;
				browseId: string;
				videoId?: string;
				autoMixList?: string;
				subtitles: [{ text: string; navigationEndpoint: NavigationEndpoint }];
			}
		];
	}
];
