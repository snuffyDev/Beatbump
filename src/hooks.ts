import { dev } from "$app/env";
import type { GetSession, Handle } from "@sveltejs/kit";
// import { installFetch } from "@sveltejs/kit/install-fetch";

const rootDomain = import.meta.env.VITE_DOMAIN; // or your server IP for dev
const originURL = import.meta.env.VITE_SITE_URL; // or your server IP for dev
// installFetch();
const headers = {
	"X-Frame-Options": "SAMEORIGIN",
	"Referrer-Policy": "no-referrer",
	"Access-Control-Allow-Origin": dev ? "*" : originURL,
	"Permissions-Policy": `accelerometer=(), autoplay="*", camera=(), document-domain=(), encrypted-media=(), fullscreen=(), gyroscope=(), interest-cohort=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), xr-spatial-tracking=(), geolocation=()`,
	"X-Content-Type-Options": "nosniff",
	"Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
};

const checkUserAgent = (userAgent: string) =>
	/i(Phone|Pad|Pod)/i.test(userAgent);

// installFetch();
export const handle: Handle = async ({ event, resolve }) => {
	// console.log(event.request.headers.get('User-Agent'));
	event.locals.iOS = checkUserAgent(event.request.headers.get("User-Agent"));
	// console.log(event.locals.iOS, event.request.headers.get("User-Agent"));
	const response = await resolve(event);
	Object.entries(headers).forEach(([key, value]) =>
		response.headers.set(`${key}`, `${value}`)
	);

	return response;
};

export const getSession: GetSession = (event) => {
	return event.locals.iOS
		? {
				iOS: event.locals.iOS
		  }
		: {};
};
