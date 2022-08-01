import { Options, transform, transformFileSync } from "@swc/core";
import { PluginOption } from "vite";
const REG = /\.(js|mjs|jsx|ts|tsx)$/;
export default function swc(options: Options = {}): PluginOption[] {
	return [
		{
			name: "vite-plugin-swc",
			enforce: "pre",
			config(config, env) {
				config.esbuild = false;
			},
			async transform(code, id) {
				if (!id.includes("node_modules") && id.includes(".svelte") === false && REG.test(id)) {
					const isTypescript = /\.(ts|tsx)$/.test(id);
					const opt: Options = {
						filename: id,
						// jsc: {
						// 	target: 'es2022', parser: { syntax: isTypescript ? 'typescript' : 'ecmascript' }, transform: {}
						// },
						jsc: {
							target: "es2022",
							parser: { syntax: isTypescript ? "typescript" : "ecmascript" },
							transform: { optimizer: {} },
							minify: {
								compress: { dead_code: true, loops: true, join_vars: true, defaults: true },
								format: {},
							},
						},
					};
					const result = await transform(code, Object.assign({}, options, opt));
					// console.log('transforming with swc');
					return result;
				}
			},
		},
	];
}
