import { dev } from "$app/env";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, url }) => {
	if (dev) {
		return json({ version: Date.now() });
	}
	try {
		const app_version = await fetch('/_app/version.json').then((res) => res.json()).then((data) => parseInt(data?.version || "0") as number);

		const version = new Date(app_version);
		const version_fmt = `${version.getUTCFullYear()}.${version.getMonth().toString().padStart(2, "0")}.${version.getDay().toString().padStart(2, "0")}`;
		return json({ method: request.method, version: version_fmt });

	} catch (err) {
		throw error(500, err);
	}
};