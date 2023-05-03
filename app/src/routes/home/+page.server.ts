import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, url, depends }) => {
	depends("home:load");
	const params = url.searchParams.get("params");
	const data = await fetch(
		`/home.json${params ? `?params=${params}` : ""}`,
	).then((r) => r.json());

	return { ...data, params, path: url.pathname };
};
