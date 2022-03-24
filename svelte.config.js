// /* eslint-disable no-undef */

import node from '@sveltejs/adapter-node';
import adapter from '@sveltejs/adapter-cloudflare-workers';
// import worker from '@snuffydev/adapter-cloudflare-cache'
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import path from 'path';
import sveltePreprocess from 'svelte-preprocess';
import dotenv from 'dotenv';
dotenv.config();

const rootDomain = process.env['VITE_DOMAIN']; // or your server IP for dev
const originURL = process.env['VITE_SITE_URL']; // or your server IP for dev

const docker = process.env.DOCKER_BUILD;
console.log(docker);
const check = process.env.NODE_ENV;
const dev = check === 'development';
/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: sveltePreprocess({
		sass: false,
		scss: {
			includePaths: ['src'],
			prependData: '@import "src/global/stylesheet/base/_variables.scss";',
			renderSync: true
		},

		postcss: {
			plugins: [cssnano({ preset: 'cssnano-preset-default' }), autoprefixer({})]
		}
	}),

	kit: {
		adapter: dev ? node() : adapter(),
		csp: {
			mode: 'nonce',
			directives: {
				'base-uri': ['self'],
				'child-src': ['self'],
				'connect-src': dev
					? ['self', 'ws://localhost:*', 'ws://*', 'blob://*', '*']
					: [
							'self',
							'ws://localhost:*',
							'https://*.googlevideo.com',
							'wss://*.peerjs.com',
							'ws://*.peerjs.com'
					  ],
				// 'connect-src': ,
				'img-src': [
					'self',
					'data:',
					'blob:',
					'https://*.ytimg.com',
					'https://*.googleusercontent.com',
					'https://*.ggpht.com',
					'https://www.gstatic.com/'
				],
				'font-src': ['self', 'data:'],
				'form-action': ['self'],
				'frame-ancestors': ['self'],
				'frame-src': ['self'],
				'manifest-src': ['self'],
				'media-src': [
					'self',
					'data:',
					'blob://*',
					'blob:*',
					'ws://localhost:*',
					'localhost:*',
					'https://*.googlevideo.com'
				],
				'object-src': ['none'],
				'style-src': ['self', 'unsafe-inline'],
				'default-src': [
					'self',
					rootDomain,
					`ws://${rootDomain}`,
					'localhost:*',
					'https://*.googlevideo.com/',
					'https://static.cloudflareinsights.com'
				],
				'script-src': [
					'self',
					'localhost:*',
					'sha256-jJRyFHbyYyWq0qnPRIobBCZON4vc+P5RXzYgJ5fHVTg=',
					'report-sample',
					'https://static.cloudflareinsights.com'
				],
				'worker-src': ['self']
			}
		},
		files: {
			assets: 'static',
			lib: 'src/lib',
			routes: 'src/routes',
			serviceWorker: 'src/service-worker',
			template: 'src/app.html',
			hooks: 'src/hooks'
		},
		vite: {
			resolve: {
				alias: {
					$stores: path.resolve('./src/lib/stores'),
					$api: path.resolve('./src/routes/api'),
					$components: path.resolve('./src/lib/components')
				}
			}
		}
	},
	onwarn(warning, defaultHandler) {
		// don't warn on <marquee> elements, cos they're cool
		if (warning.code === 'css-unused-selector') return;

		// handle all other warnings normally
		defaultHandler(warning);
	}
};
export default config;
