import type { LayoutServerLoad } from "./$types";
export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		iOS: locals.iOS,
		Android: locals.Android,
	};
};
