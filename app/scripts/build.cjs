#!/usr/bin/env node

const child_process = require("child_process");
const fs = require("fs");
const path = require("path");

const { CLI } = require("@snuffydev/fast-cli");
const root = path.resolve(__dirname, "../");

const beatbump_config_path = path.resolve(root, "beatbump.conf.json");
const json_config = JSON.parse(fs.readFileSync(beatbump_config_path, { encoding: "utf8" }));
const pkg = JSON.parse(fs.readFileSync(path.resolve(root, "package.json"), { encoding: "utf8" }));
const json = json_config;

const adapter = json["environment"]["adapter"] ?? "vercel";
const port = json["port"] ?? 3000;
const svelteConfigPath = path.join(root, "svelte.config.js");
const originalSvelteConfig = fs.readFileSync(svelteConfigPath, { encoding: "utf-8" });

let modifiedSvelteConfig = "";

async function installAdapter(adapter, options) {
	try {
		modifiedSvelteConfig = originalSvelteConfig;

		if (adapter.match(/vercel|node|netlify/g)) {
			modifiedSvelteConfig = modifiedSvelteConfig.replace(
				new RegExp(`${adapter}\\(.+`, ""),
				`${adapter}(${JSON.stringify(options)}),`,
			);
		}

		fs.writeFileSync(svelteConfigPath, modifiedSvelteConfig, { encoding: "utf-8" });
		return true;
	} catch (err) {
		console.error(err);
	}
}

const cli = new CLI("Beatbump CLI");

cli
	.command("build", [""])
	.describe("Builds Beatbump")
	.action(() => {
		try {
			if (!beatbump_config_path) {
				console.error(`No config file was found. Please create a file named 'beatbump.config.json' at ${rootPath}`);
				return;
			}
			const options = adapter.match(/node|vercel|netlify/g) ? json["platform"][adapter] : null;

			if (!pkg.devDependencies[`@sveltejs/adapter-${adapter}`]) {
				console.info(`Adapter @sveltejs/adapter-${adapter} was not found. Installing...`);

				child_process.spawnSync(`npm`, [`i`, `-D`, `@sveltejs/adapter-${adapter}@next`], {
					stdio: "inherit",
					env: process.env,
					cwd: rootPath,
					shell: true,
				});

				console.info(`Installed successfully. Starting build...`);
			}

			/// Setup config
			console.info(`Setting up svelte.config.js with user provided config...`);
			const adapter_installed = installAdapter(adapter, options);

			console.info(`Building Beatbump, please wait...`);

			/// If installAdapter doesn't return a truthy value, then there was an error
			/// so we abort
			if (!adapter_installed) console.info("Error installing config.");
			let hooks_ts;
			const hooks_path = path.resolve(root, "./src/hooks.server.ts") || path.resolve(".", "../src/hooks.server.ts");
			if (adapter === "node") {
				hooks_ts = fs.readFileSync(hooks_path, { encoding: "utf-8" });
				let modified_hooks_ts = hooks_ts.replace(/\/\/#NODE /gm, "");
				fs.writeFileSync(hooks_path, modified_hooks_ts, { encoding: "utf-8" });
			}
			/// run the build
			child_process.spawnSync("npx", ["vite", "build"], {
				stdio: "inherit",
				env: { ...process.env, BB_ADAPTER: adapter, PORT: port },
				cwd: root,
				shell: true,
			});
			console.info(`Finished build`);
			if (adapter === "node") fs.writeFileSync(hooks_path, hooks_ts, { encoding: "utf-8" });
		} catch (err) {
			console.error(err);
		}
	});

cli.parse(process.argv.slice(2));
