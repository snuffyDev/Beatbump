const p: NodeJS.Process =
	typeof process !== "undefined" ? process : ({ env: {} } as NodeJS.Process);

import { PUBLIC_ALLOW_THUMBNAIL_PROXY } from "$env/static/public";
import {
	defaultCookieParams,
	type PreferencesCookie,
} from "$lib/server/cookies";
import { objectKeys } from "$lib/utils/collections/objects";
import type { Cookies, Handle } from "@sveltejs/kit";

const headers = {
	"Referrer-Policy": "no-referrer",
	"Permissions-Policy": `accelerometer=(), autoplay="*", camera=(), document-domain=(), encrypted-media=(), fullscreen=(), gyroscope=(), interest-cohort=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), xr-spatial-tracking=(), geolocation=()`,
	"X-Content-Type-Options": "nosniff",
	"Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

const checkUserAgent = (userAgent: string | null) =>
	userAgent !== null
		? /i(Phone|Pad|Pod)/i.test(userAgent)
			? "iOS"
			: /Android/i.test(userAgent)
			? "Android"
			: "Other"
		: "Other";

const forceThumbnailProxyUserConfig = (preferences: PreferencesCookie) => {
	if (PUBLIC_ALLOW_THUMBNAIL_PROXY === "false") {
		preferences["Proxy Thumbnails"] = false;
	}
	return preferences;
};

const updatePreferencesCookie = (cookies: Cookies) => {
	const prefsCookie = cookies.get("_prefs") ?? "";

	const preferences: PreferencesCookie = prefsCookie
		? JSON.parse(atob(prefsCookie))
		: {
				"Proxy Thumbnails":
					PUBLIC_ALLOW_THUMBNAIL_PROXY === "true" ? true : false,
				Restricted: false,
		  };

	cookies.set(
		"_prefs",
		btoa(JSON.stringify(forceThumbnailProxyUserConfig(preferences))),
		defaultCookieParams(),
	);
	return preferences;
};

const HEADER_KEYS = objectKeys(headers);

export const handle: Handle = async ({ event, resolve }) => {
	const UA = event.request.headers.get("User-Agent");
	const agentType = checkUserAgent(UA);
	const preferences = updatePreferencesCookie(event.cookies);

	event.locals.iOS = agentType === "iOS";
	event.locals.Android = agentType === "Android";
	event.locals.preferences = preferences;
	const response = await resolve(event);

	for (const key of HEADER_KEYS) {
		response.headers.set(`${key}`, `${headers[key]}`);
	}
	return response;
};

// process.on('SIGINT', function () { process.exit(); }); // Ctrl+C
// process.on('SIGTERM', function () { process.exit(); }); // docker stop
