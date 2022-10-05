import { sveltekit } from "@sveltejs/kit/vite";
import type { UserConfig } from "vite";
const version = new Date(Date.now());
const version_fmt = `${version.getUTCFullYear()}.${version.getMonth().toString().padStart(2, "0")}.${version
	.getDay()
	.toString()
	.padStart(2, "0")}`;
/** @type {*} */
const config: UserConfig = {
	plugins: [sveltekit()],
	legacy: {},
	optimizeDeps: { esbuildOptions: {}, exclude: [""] },

	build: {
		minify: "esbuild",
		cssTarget: ["chrome58", "edge16", "firefox57", "safari11"],
		dynamicImportVarsOptions: {},
		target: "",
		rollupOptions: {},
	},
	define: {
		"process.env.APP_VERSION": JSON.stringify(version_fmt),
	},

	experimental: {},
	esbuild: { treeShaking: true, minifyWhitespace: true, minifyIdentifiers: true, minifySyntax: true },
	css: {},
	worker: {
		plugins: [],
		format: "es",
		rollupOptions: { treeshake: {}, output: {} },
	},
};
export default config;
