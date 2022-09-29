import type { LayoutLoad } from "./$types";
export const load: LayoutLoad = async ({ url, data }) => {
	// const { Android, iOS } = data;
	return {
		key: url.pathname,
		page: url.pathname,
		origin: url.origin,
		...data,
	};
};
