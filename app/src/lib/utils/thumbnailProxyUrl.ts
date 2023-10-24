import type { Thumbnail } from "$lib/types";

export const proxyUrls = (origin: string) => {
	return (thumbnail: Thumbnail) => {
		if (thumbnail.url) thumbnail.url = thumbnailProxyUrl(origin, thumbnail.url);
		if (thumbnail.placeholder)
			thumbnail.placeholder = thumbnailProxyUrl(origin, thumbnail.placeholder);
		if (thumbnail.original_url)
			thumbnail.original_url = thumbnailProxyUrl(
				origin,
				thumbnail.original_url,
			);

		return thumbnail;
	};
};
export const thumbnailProxyUrl = (origin: string, url: string) => {
	const urlNoHttps = url.replace(/https?:\/\//g, "");
	const hostname = urlNoHttps.slice(0, 3);
	const path = url.slice(url.indexOf(".com/") + 5);
	return `${origin}/i/${
		hostname === "y.i" ? "vi" : hostname === "i.y" ? "vi" : hostname
	}/${path.slice(0, 3) === "vi/" ? path.slice(3) : path}`;
};
