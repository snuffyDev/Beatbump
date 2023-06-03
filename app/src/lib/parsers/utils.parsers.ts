import type { Subtitle } from "$lib/types";
import type { PurpleRun } from "$lib/types/innertube/internals";

const URL_REGEX = /=w\d+-h\d+-/gm;
export function thumbnailTransformer(url: string): {
	placeholder?: string;
	url?: string;
} {
	const output: {
		placeholder?: string;
		url?: string;
	} = { url: "", placeholder: "" };
	if (!url.includes("lh3.googleusercontent.com")) {
		const split_url = url.split("?");
		const webp_url = split_url[0];
		output.url = webp_url;
		output.placeholder = webp_url?.replace("sddefault", "default");
		return output;
	}
	const webp_url = url?.replace("-rj", "-rw");
	output.url = webp_url;

	output.placeholder = webp_url?.replace(URL_REGEX, "=w1-h1-fSoften=50,50,05-");

	return output;
}

export function subtitle(items: PurpleRun[]): Subtitle[] {
	return items.map((item) => {
		if (item.navigationEndpoint === undefined) {
			return item as unknown as Subtitle;
		}

		return {
			text: item.text,
			browseId: item.navigationEndpoint.browseEndpoint?.browseId,
			pageType:
				item.navigationEndpoint?.browseEndpoint
					?.browseEndpointContextSupportedConfigs
					?.browseEndpointContextMusicConfig?.pageType,
		};
	});
}
