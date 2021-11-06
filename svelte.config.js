// /* eslint-disable no-undef */

import node from '@sveltejs/adapter-node'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import path from 'path'
import sveltePreprocess from 'svelte-preprocess'
const check = process.env.NODE_ENV
const dev = check === 'development'
import worker from '@snuffydev/adapter-cloudflare-cache'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: sveltePreprocess({
		scss: {
			includePaths: ['src'],
		},

		postcss: {
			plugins: [cssnano({ preset: 'cssnano-preset-default' }), autoprefixer({})]
		},
		typescript: { tsconfigFile: './tsconfig.json' }
	}),
	kit: {
		adapter: dev ? node() : worker({}),
		target: '#app',
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
			},
			cleanCssOptions: {
				level: {
					2: {
						all: true,
						removeDuplicateRules: true,

					}
				}
			}
		}
	}
}
export default config