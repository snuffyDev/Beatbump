const rootDomain = import.meta.env.VITE_DOMAIN // or your server IP for dev

const directives = {
	'base-uri': ["'self'"],
	'child-src': ["'self'"],
	'connect-src': ["'self'", 'ws://localhost:*'],
	// 'connect-src': ["'self'", 'ws://localhost:*', 'https://hcaptcha.com', 'https://*.hcaptcha.com'],
	'img-src': [
		"'self'",
		'data:',
		'https://i.ytimg.com',
		'https://lh3.googleusercontent.com',
		'https://yt3.ggpht.com'
	],
	'font-src': ["'self'", 'data:'],
	'form-action': ["'self'"],
	'frame-ancestors': ["'self'"],
	'frame-src': [
		"'self'"
		// "https://*.stripe.com",
		// "https://*.facebook.com",
		// "https://*.facebook.net",
		// 'https://hcaptcha.com',
		// 'https://*.hcaptcha.com',
	],
	'manifest-src': ["'self'"],
	'media-src': ["'self'", 'data:', 'https://*.googlevideo.com'],
	'object-src': ["'none'"],
	'style-src': ["'self'", "'unsafe-inline'"],
	// 'style-src': ["'self'", "'unsafe-inline'", 'https://hcaptcha.com', 'https://*.hcaptcha.com'],
	'default-src': [
		"'self'",
		rootDomain,
		`ws://${rootDomain}`,
		'localhost:*',
		'https://*.googlevideo.com/',
		'https://static.cloudflareinsights.com'
		// 'https://*.google.com',
		// 'https://*.googleapis.com',
		// 'https://*.firebase.com',
		// 'https://*.gstatic.com',
		// 'https://*.cloudfunctions.net',
		// 'https://*.algolia.net',
		// 'https://*.facebook.com',
		// 'https://*.facebook.net',
		// 'https://*.stripe.com',
		// 'https://*.sentry.io',
	],
	'script-src': [
		"'self'",
		"'unsafe-inline'",
		"'report-sample'",
		'https://static.cloudflareinsights.com'
		// 'https://*.stripe.com',
		// 'https://*.facebook.com',
		// 'https://*.facebook.net',
		// 'https://hcaptcha.com',
		// 'https://*.hcaptcha.com',
		// 'https://*.sentry.io',
		// 'https://polyfill.io',
	],
	'worker-src': ["'self'"]
	// remove report-to & report-uri if you do not want to use Sentry reporting
	// 'report-to': ["'csp-endpoint'"],
	// 'report-uri': [
	// 	`https://sentry.io/api/${import.meta.env.VITE_SENTRY_PROJECT_ID}/security/?sentry_key=${
	// 		import.meta.env.VITE_SENTRY_KEY
	// 	}`,
	// ],
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
