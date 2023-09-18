import adapterCf from "@sveltejs/adapter-cloudflare";
import adapterCfw from "@sveltejs/adapter-cloudflare-workers";
import netlify from "@sveltejs/adapter-netlify";
import node from "@sveltejs/adapter-node";
import vercel from "@sveltejs/adapter-vercel";
import path from "path";
import sveltePreprocess from "svelte-preprocess";
import { fileURLToPath } from "url";


const dev = process.env["NODE_ENV"] === "development";
const ENV_ADAPTER = process.env["BB_ADAPTER"] ?? "cloudflare-workers";

const adapters = {
    "cloudflare-workers": adapterCfw({}),
    cloudflare: adapterCf(),
    vercel: vercel({}),
    netlify: netlify({}),
    node: node({ "precompress": false }),
};

const adapter = adapters[ENV_ADAPTER];

const SASS_PATH = `${path.dirname(
    fileURLToPath(import.meta.url),
)}/src/global/redesign/base/_variables.scss`;

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: sveltePreprocess({
        sass: false,

        scss: {
            includePaths: ["./src/"],

            prependData: `@use "${SASS_PATH}" as *;`,
            stripIndent: true,
        },
        postcss: { configFilePath: path.resolve("./postcss.config.cjs") },
    }),

    kit: {
        adapter: dev ? node() : adapter,
        alias: {
            $stores: path.resolve("./src/lib/stores"),
            $api: path.resolve("./src/routes/(app)/api/_lib"),
            $components: path.resolve("./src/lib/components"),
        },
        prerender: { concurrency: 3 },
        files: {
            assets: "static",
            lib: "src/lib",
            routes: "src/routes",
            serviceWorker: "src/service-worker",
            appTemplate: "src/app.html",
            hooks: { server: "src/hooks.server" },
        },
        version: { pollInterval: 600000 },
    },
    onwarn(warning, defaultHandler) {
        if (warning.code === "css-unused-selector") return;

        defaultHandler(warning);
    },
};
export default config;
