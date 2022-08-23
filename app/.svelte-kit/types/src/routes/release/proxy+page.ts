import type { PageLoad } from "./$types";
let path;
// throw new Error("@migration task: Migrate the load function input (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693)");
export const load = async ({ url, fetch }: Parameters<PageLoad>[0]) => {
	path = url.pathname;
	const browseId = url.searchParams.get("id") || "";
	const pt = url.searchParams.get("type") || "";
	const response = await fetch(
		`/api/main.json?q=&endpoint=browse${browseId ? `&browseId=${browseId}` : ""}${pt ? `&pt=${pt}` : ""}`,
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
