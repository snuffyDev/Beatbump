import type { LayoutLoad } from "./$types";
export const load = async ({ url, data }: Parameters<LayoutLoad>[0]) => {
	// throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693)");
	return {
		key: url.pathname,
		page: url.pathname,
		...data,
		// props: {
		// 	key: url.pathname,
		// },
		// stuff: { page: url.pathname },
	};
};
