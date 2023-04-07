import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, url }) => {
	// console.count("CONNECTION!");
	const params = url.searchParams.get("params");
	const data = await fetch(`/home.json${params ? `?params=${params}` : ""}`).then((r) => r.json());
	// throw Error("TEST");
	return { ...data, params, path: url.pathname };
};
