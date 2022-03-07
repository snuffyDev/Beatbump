// /* eslint-disable no-undef */

import node from '@sveltejs/adapter-node'
import adapter from '@sveltejs/adapter-cloudflare-workers'
// import worker from '@snuffydev/adapter-cloudflare-cache'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import path from 'path'
import sveltePreprocess from 'svelte-preprocess'

const check = process.env.NODE_ENV
const dev = check === 'development'
/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: sveltePreprocess({
		sass: false,
		scss: {

			includePaths: ['src'], prependData: '@import "src/global/stylesheet/base/_variables.scss";', renderSync: true
		},

		postcss: {
			plugins: [cssnano({ preset: 'cssnano-preset-default' }), autoprefixer({})]
		},
	}),

	kit: {
		adapter: dev ? node() : adapter(),
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


		}
	},
	onwarn(warning, defaultHandler) {
		// don't warn on <marquee> elements, cos they're cool
		if (warning.code === "css-unused-selector")
			return;

		// handle all other warnings normally
		defaultHandler(warning);
	}

}
export default config
