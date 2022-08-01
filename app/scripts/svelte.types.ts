export interface SvelteConfig {
	preprocess: any;
	kit: {
		adapter: import("@sveltejs/kit").Adapter;
		files: {
			assets: string;
			lib: string;
			routes: string;
			serviceWorker: string;
			template: string;
			hooks: string;
		};
		version: {
			pollInterval: number;
		};
		vite: {
			resolve: {
				alias: {
					$stores: string;
					$api: string;
					$components: string;
				};
			};
			server: {};
			build: {
				minify: string;
			};
			esbuild: {
				minify: boolean;
				treeShaking: boolean;
			};
		};
	};
	onwarn(warning: any, defaultHandler: any): void;
}

export interface SvelteConfigJSON {
	content: string;
}
