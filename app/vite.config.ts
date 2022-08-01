import { sveltekit } from "@sveltejs/kit/vite";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import type { UserConfig } from "vite";
const config: UserConfig = {
	plugins: [sveltekit()],

	build: {
		minify: "esbuild",
		cssTarget: ["chrome58", "edge16", "firefox57", "safari11"],
	},
	esbuild: { treeShaking: true, minifyWhitespace: true, minifyIdentifiers: true, minifySyntax: true },
	css: { postcss: { plugins: [autoprefixer, cssnano] } },
};

export default config;
