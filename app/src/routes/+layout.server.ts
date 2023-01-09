import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
	return {
		key: url.pathname,
		page: url.pathname,
		origin: url.origin,
		iOS: locals.iOS,
		Android: locals.Android,
	};
};
