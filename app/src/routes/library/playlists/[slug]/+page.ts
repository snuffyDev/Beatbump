import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
	const playlistName = params.slug;
	return {
		playlistName,
	};
};
