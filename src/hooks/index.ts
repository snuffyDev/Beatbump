const rootDomain = import.meta.env.VITE_DOMAIN // or your server IP for dev

const directives = {
	'base-uri': ["'self'"],
	'child-src': ["'self'"],
	'connect-src': ["'self'", 'ws://localhost:*'],
	'img-src': [
		"'self'",
		'data:',
		'https://*.ytimg.com',
		'https://*.googleusercontent.com',
		'https://*.ggpht.com'
	],
	'font-src': ["'self'", 'data:'],
	'form-action': ["'self'"],
	'frame-ancestors': ["'self'"],
	'frame-src': ["'self'"],
	'manifest-src': ["'self'"],
	'media-src': ["'self'", 'data:', 'https://*.googlevideo.com'],
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
		"'report-sample'",
		'https://static.cloudflareinsights.com'
	],
	'worker-src': ["'self'"]
}

const csp = Object.entries(directives)
	.map(([key, arr]) => key + ' ' + arr.join(' '))
	.join('; ')
export async function handle({ request, resolve }) {
	request.locals = request.headers

	const response = await resolve(request)

	return {
		...response,
		headers: {
			...response.headers,
			'X-Frame-Options': 'SAMEORIGIN',
			'Referrer-Policy': 'no-referrer',
			'Permissions-Policy':
				'accelerometer=(), autoplay=(), camera=(), document-domain=(), encrypted-media=(), fullscreen=(), gyroscope=(), interest-cohort=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), xr-spatial-tracking=(), geolocation=()',
			'X-Content-Type-Options': 'nosniff',
			/* Switch from Content-Security-Policy-Report-Only to Content-Security-Policy once you are satisifed policy is what you want
			 * on switch comment out the Report-Only line
			 */
			// 'Content-Security-Policy-Report-Only': csp,
			'Content-Security-Policy': csp,
			'Strict-Transport-Security':
				'max-age=31536000; includeSubDomains; preload'
			// remove/change lines below if you do not want to use sentry for reporting
		}
	}
}
