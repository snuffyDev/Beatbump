import { sveltekit } from "@sveltejs/kit/vite";
import type { UserConfig } from "vite";
/** @type {*} */
const config: UserConfig = {
	plugins: [sveltekit()],
	legacy: {},
	optimizeDeps: { esbuildOptions: {}, exclude: [''] },

	build: {
		minify: "esbuild",
		cssTarget: ["chrome58", "edge16", "firefox57", "safari11"],
		dynamicImportVarsOptions: {},
		target: '',
	},
	esbuild: { treeShaking: true, minifyWhitespace: true, minifyIdentifiers: true, minifySyntax: true },
	css: {}, worker: {
		plugins: [], format: 'es', rollupOptions: { treeshake: {}, output: {} }
	}
};
export default config;
