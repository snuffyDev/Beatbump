import { ItemBuilder, parsePageContents } from "$lib/parsers";

export const load = async ({ url, fetch, locals }) => {
	const path = url.pathname;
	const browseId = url.searchParams.get("id") || "";
	const pt = url.searchParams.get("type") || "";
	const response = await fetch(
		`/api/v1/main.json?q=&endpoint=browse${
			browseId ? `&browseId=${browseId}` : ""
		}${pt ? `&pt=${pt}` : ""}`,
	);
	const data = await response.json();
	if (!response.ok) {
		return {
			status: response.status,
			msg: response.body,
		};
	}
	const itemBuilder = new ItemBuilder({
		proxy: locals.preferences["Proxy Thumbnails"],
		origin: url.origin,
	});
	const promise = await parsePageContents(data, itemBuilder);

	return {
		items: promise,
		id: browseId,
		path,
	};
};
