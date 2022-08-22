import type { LayoutLoad } from "./$types";
export const load: LayoutLoad = async ({ url, data }) => {
	return {
		key: url.pathname,
		page: url.pathname,
		...data,
	};
};
