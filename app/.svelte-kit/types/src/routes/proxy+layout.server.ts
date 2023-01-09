// @ts-nocheck
import type { LayoutServerLoad } from "./$types";

export const load = async ({ locals, url }: Parameters<LayoutServerLoad>[0]) => {
	return {
		key: url.pathname,
		page: url.pathname,
		origin: url.origin,
		iOS: locals.iOS,
		Android: locals.Android,
	};
};
