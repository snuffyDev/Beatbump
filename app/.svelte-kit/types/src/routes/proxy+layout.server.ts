// @ts-nocheck
import type { LayoutServerLoad } from "./$types";
export const load = async ({ locals }: Parameters<LayoutServerLoad>[0]) => {
	return {
		iOS: locals.iOS,
		Android: locals.Android,
	};
};
