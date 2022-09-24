// @ts-nocheck
import type { LayoutLoad } from "./$types";
export const load = async ({ url, data }: Parameters<LayoutLoad>[0]) => {
	return {
		key: url.pathname,
		page: url.pathname,
		origin: url.origin,
		...data,
	};
};
