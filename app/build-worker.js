import { buildSync, transformSync } from "esbuild";
import { readFileSync, writeFileSync } from "fs";
const file = readFileSync(new URL("./src/lib/workers/db/worker.ts", import.meta.url), { encoding: "utf-8" });

buildSync({
	external: ["hls.js", "svelte/*", "peerjs", "./src/lib/parsers/player.ts"],
	treeShaking: true,
	entryPoints: ["./src/lib/workers/db/worker.ts"],
	format: "iife",
	bundle: true,
	minify: true,
	platform: "browser",
	outfile: "./src/lib/workers/db/worker-iife.js",
});
