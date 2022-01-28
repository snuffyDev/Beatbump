import { dev } from '$app/env';
import type { GetSession, Handle } from '@sveltejs/kit';

const rootDomain = import.meta.env.VITE_DOMAIN; // or your server IP for dev
const originURL = import.meta.env.VITE_SITE_URL; // or your server IP for dev

const directives = {
	'base-uri': ["'self'"],
	'child-src': ["'self'"],
	'connect-src': dev
		? ["'self'", 'ws://localhost:*', 'ws://*', 'blob://*', '*']
		: [
				"'self'",
				'ws://localhost:*',
				'https://*.googlevideo.com',
				'wss://*.peerjs.com',
				'ws://*.peerjs.com'
		  ],
	// 'connect-src': ,
	'img-src': [
		"'self'",
		'data:',
		'blob:',
		'https://*.ytimg.com',
		'https://*.googleusercontent.com',
		'https://*.ggpht.com',
		'https://www.gstatic.com/'
	],
	'font-src': ["'self'", 'data:'],
	'form-action': ["'self'"],
	'frame-ancestors': ["'self'"],
	'frame-src': ["'self'"],
	'manifest-src': ["'self'"],
	'media-src': [
		"'self'",
		'data:',
		'blob://*',
		'blob:*',
		'ws://localhost:*',
		'localhost:*',
		'https://*.googlevideo.com'
	],
	'object-src': ["'none'"],
	'style-src': ["'self'", "'unsafe-inline'"],
	'default-src': [
		"'self'",
		rootDomain,
		`ws://${rootDomain}`,
		'localhost:*',
		'https://*.googlevideo.com/',
		'https://static.cloudflareinsights.com'
	],
	'script-src': [
		"'self'",
		"'unsafe-inline'",
		'localhost:*',

		"'report-sample'",
		'https://static.cloudflareinsights.com'
	],
	'worker-src': ["'self'"]
};

const csp = Object.entries(directives)
	.map(([key, arr]) => key + ' ' + arr.join(' '))
	.join('; ');
const headers = {
	'X-Frame-Options': 'SAMEORIGIN',
	'Referrer-Policy': 'no-referrer',
	'Access-Control-Allow-Origin': dev ? '*' : originURL,
	'Permissions-Policy': `accelerometer=(), autoplay="*", camera=(), document-domain=(), encrypted-media=(), fullscreen=(), gyroscope=(), interest-cohort=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), xr-spatial-tracking=(), geolocation=()`,
	'X-Content-Type-Options': 'nosniff',
	'Content-Security-Policy': csp,
	'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

const checkUserAgent = (userAgent: string) =>
	/i(Phone|Pad|Pod)/i.test(userAgent);

export const handle: Handle = async ({ event, resolve }) => {
	// console.log(event.request.headers.get('User-Agent'));
	event.locals.iOS = checkUserAgent(event.request.headers.get('User-Agent'));
	const response = await resolve(event);
	Object.entries(headers).forEach(([key, value]) =>
		response.headers.set(`${key}`, `${value}`)
	);
	// console.log(event.url);
	// console.log(JSON.stringify(request.headers))

	return response;
};

export const getSession: GetSession = (event) => {
	return event.locals.iOS
		? {
				iOS: event.locals.iOS
		  }
		: {};
};
