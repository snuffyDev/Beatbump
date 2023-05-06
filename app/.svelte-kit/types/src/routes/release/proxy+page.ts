// @ts-nocheck
import type { PageLoad } from "./$types";

export const load = async ({ url, fetch }: Parameters<PageLoad>[0]) => {
	const path = url.pathname;
	const browseId = url.searchParams.get("id") || "";
	const pt = url.searchParams.get("type") || "";
	const response = await fetch(
		`/api/v1/main.json?q=&endpoint=browse${browseId ? `&browseId=${browseId}` : ""}${pt ? `&pt=${pt}` : ""}`,
	);
	const data = await response.json();
	if (!response.ok) {
		return {
			status: response.status,
			msg: response.body,
		};
	}

	return {
		data: data,
		id: browseId,
		path,
	};
};
