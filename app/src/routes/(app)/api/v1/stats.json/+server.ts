import { dev } from "$app/environment";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, url }) => {
	if (dev) {
		return json({ version: Date.now() });
	}
	try {
		const version = process.env.APP_VERSION;
		return json({ method: request.method, version: version });
	} catch (err) {
		throw error(500, err);
	}
};
