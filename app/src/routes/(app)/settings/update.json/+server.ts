import {
	defaultCookieParams,
	type PreferencesCookie,
} from "$lib/server/cookies";
import { error, json, type Cookies } from "@sveltejs/kit";

const updatePreferencesCookie = (
	locals: App.Locals["preferences"],
	cookies: Cookies,
	updatedBody: Partial<PreferencesCookie> = {},
) => {
	const prefs = locals;

	const preferences: PreferencesCookie = prefs
		? prefs
		: { "Proxy Thumbnails": true, Restricted: false };

	cookies.set(
		"_prefs",
		btoa(JSON.stringify({ ...preferences, ...updatedBody })),
		defaultCookieParams(),
	);
	return { ...preferences, ...updatedBody };
};
export const POST = async ({ request, locals, cookies }) => {
	const data = (await request.json()) as App.Locals["preferences"];

	if (
		typeof data["Proxy Thumbnails"] === "undefined" &&
		typeof data["Restricted"] === "undefined"
	)
		throw error(500, { message: "Missing body arguments" });

	const prefs = updatePreferencesCookie(locals.preferences, cookies, data);

	return json("OK");
};
