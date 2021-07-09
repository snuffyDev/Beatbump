// /* eslint-disable no-undef */

import node from '@sveltejs/adapter-node'

import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import fs from 'fs'
import sveltePreprocess from 'svelte-preprocess'

const check = process.env.NODE_ENV
const dev = check === 'development'
import worker from '@sveltejs/adapter-cloudflare-workers'
/** @type {import('@sveltejs/kit').Config} */
export default {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: sveltePreprocess({
        scss: {
            includePaths: ['src'],
            prependData: `@import 'src/global/scss/utility/themes.scss'; @import 'src/global/scss/utility/_mixins.scss';`
        },
        defaults: {
            style: 'postcss'
        },
        postcss: {
            plugins: [cssnano({ preset: 'default' }), autoprefixer({})]
        }
    }),
    kit: {
        adapter: dev ? node() : worker(),

        files: {
            assets: 'static',
            lib: 'src/lib',
            routes: 'src/routes',
            serviceWorker: 'src/service-worker',
            template: 'src/app.html',
        }
    }
}
