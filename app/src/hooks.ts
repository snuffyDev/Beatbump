import { dev } from "$app/env";

import type { GetSession, Handle } from "@sveltejs/kit";
// import { installFetch } from "@sveltejs/kit/install-fetch";

const rootDomain = import.meta.env.VITE_DOMAIN; // or your server IP for dev
const originURL = import.meta.env.VITE_SITE_URL; // or your server IP for dev

const headers = {
	"X-Frame-Options": "SAMEORIGIN",
	"Referrer-Policy": "no-referrer",
	"Access-Control-Allow-Origin": dev ? "*" : originURL,
	"Permissions-Policy": `accelerometer=(), autoplay="*", camera=(), document-domain=(), encrypted-media=(), fullscreen=(), gyroscope=(), interest-cohort=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), xr-spatial-tracking=(), geolocation=()`,
	"X-Content-Type-Options": "nosniff",
	"Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};
// installFetch();
const checkUserAgent = (userAgent: string) =>
	/i(Phone|Pad|Pod)/i.test(userAgent) ? "iOS" : /Android/i.test(userAgent) ? "Android" : "Other";

export const handle: Handle = async ({ event, resolve }) => {
	const UA = event.request.headers.get("User-Agent");
	event.locals.iOS = checkUserAgent(UA) === "iOS";
	event.locals.Android = checkUserAgent(UA) === "Android";

	const response = await resolve(event);
	for (const key in headers) {
		response.headers.set(`${key}`, `${headers[key]}`);
	}
	return response;
};

export const getSession: GetSession = (event) => {
	return event.locals.iOS
		? {
				iOS: event.locals.iOS,
				Android: event.locals.Android,
		  }
		: {};
};
