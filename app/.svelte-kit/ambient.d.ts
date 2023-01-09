
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const VITE_DOMAIN: string;
	export const VITE_SITE_URL: string;
	export const VITE_DONATION_URL: string;
	export const PORT: string;
	export const SHELL: string;
	export const npm_command: string;
	export const SESSION_MANAGER: string;
	export const npm_config_userconfig: string;
	export const XDG_CONFIG_DIRS: string;
	export const npm_config_cache: string;
	export const PW_TEST_REPORTER: string;
	export const XDG_SESSION_PATH: string;
	export const XDG_MENU_PREFIX: string;
	export const PW_TEST_REUSE_CONTEXT: string;
	export const APPLICATION_INSIGHTS_NO_DIAGNOSTIC_CHANNEL: string;
	export const NODE: string;
	export const LC_ADDRESS: string;
	export const DOTNET_ROOT: string;
	export const LC_NAME: string;
	export const SSH_AUTH_SOCK: string;
	export const FORCE_COLORS: string;
	export const COLOR: string;
	export const npm_config_local_prefix: string;
	export const DESKTOP_SESSION: string;
	export const LC_MONETARY: string;
	export const SSH_AGENT_PID: string;
	export const NO_AT_BRIDGE: string;
	export const npm_config_globalconfig: string;
	export const VSCODE_AMD_ENTRYPOINT: string;
	export const EDITOR: string;
	export const GTK_MODULES: string;
	export const XDG_SEAT: string;
	export const PWD: string;
	export const XDG_SESSION_DESKTOP: string;
	export const LOGNAME: string;
	export const QT_QPA_PLATFORMTHEME: string;
	export const XDG_SESSION_TYPE: string;
	export const PW_TEST_REPORTER_WS_ENDPOINT: string;
	export const PANEL_GDK_CORE_DEVICE_EVENTS: string;
	export const npm_config_init_module: string;
	export const VSCODE_CODE_CACHE_PATH: string;
	export const _: string;
	export const XAUTHORITY: string;
	export const XDG_GREETER_DATA_DIR: string;
	export const MOTD_SHOWN: string;
	export const GDM_LANG: string;
	export const GTK2_RC_FILES: string;
	export const HOME: string;
	export const LANG: string;
	export const LC_PAPER: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const PLAYWRIGHT_TEST_BASE_URL: string;
	export const npm_package_version: string;
	export const VSCODE_IPC_HOOK: string;
	export const VSCODE_CLI: string;
	export const PW_TS_ESM_ON: string;
	export const XDG_SEAT_PATH: string;
	export const PW_TEST_HTML_REPORT_OPEN: string;
	export const INIT_CWD: string;
	export const DOTNET_BUNDLE_EXTRACT_BASE_DIR: string;
	export const CHROME_DESKTOP: string;
	export const npm_lifecycle_script: string;
	export const XDG_SESSION_CLASS: string;
	export const LC_IDENTIFICATION: string;
	export const npm_package_name: string;
	export const npm_config_prefix: string;
	export const USER: string;
	export const DISPLAY: string;
	export const npm_lifecycle_event: string;
	export const VSCODE_PID: string;
	export const SHLVL: string;
	export const LC_TELEPHONE: string;
	export const LC_MEASUREMENT: string;
	export const VSCODE_CWD: string;
	export const XDG_VTNR: string;
	export const UBUNTU_MENUPROXY: string;
	export const XDG_SESSION_ID: string;
	export const npm_config_user_agent: string;
	export const npm_execpath: string;
	export const XDG_RUNTIME_DIR: string;
	export const DEBUGINFOD_URLS: string;
	export const npm_package_json: string;
	export const LC_TIME: string;
	export const npm_config_legacy_peer_deps: string;
	export const ELECTRON_NO_ATTACH_CONSOLE: string;
	export const QT_AUTO_SCREEN_SCALE_FACTOR: string;
	export const GTK3_MODULES: string;
	export const XDG_DATA_DIRS: string;
	export const GDK_BACKEND: string;
	export const npm_config_noproxy: string;
	export const BROWSER: string;
	export const PATH: string;
	export const npm_config_metrics_registry: string;
	export const npm_config_node_gyp: string;
	export const GDMSESSION: string;
	export const ORIGINAL_XDG_CURRENT_DESKTOP: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const npm_config_global_prefix: string;
	export const VSCODE_NLS_CONFIG: string;
	export const MAIL: string;
	export const npm_node_execpath: string;
	export const npm_config_engine_strict: string;
	export const VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
	export const LC_NUMERIC: string;
	export const PW_TEST_CONNECT_WS_ENDPOINT: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://kit.svelte.dev/docs/modules#$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {

}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/master/packages/adapter-node) (or running [`vite preview`](https://kit.svelte.dev/docs/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		VITE_DOMAIN: string;
		VITE_SITE_URL: string;
		VITE_DONATION_URL: string;
		PORT: string;
		SHELL: string;
		npm_command: string;
		SESSION_MANAGER: string;
		npm_config_userconfig: string;
		XDG_CONFIG_DIRS: string;
		npm_config_cache: string;
		PW_TEST_REPORTER: string;
		XDG_SESSION_PATH: string;
		XDG_MENU_PREFIX: string;
		PW_TEST_REUSE_CONTEXT: string;
		APPLICATION_INSIGHTS_NO_DIAGNOSTIC_CHANNEL: string;
		NODE: string;
		LC_ADDRESS: string;
		DOTNET_ROOT: string;
		LC_NAME: string;
		SSH_AUTH_SOCK: string;
		FORCE_COLORS: string;
		COLOR: string;
		npm_config_local_prefix: string;
		DESKTOP_SESSION: string;
		LC_MONETARY: string;
		SSH_AGENT_PID: string;
		NO_AT_BRIDGE: string;
		npm_config_globalconfig: string;
		VSCODE_AMD_ENTRYPOINT: string;
		EDITOR: string;
		GTK_MODULES: string;
		XDG_SEAT: string;
		PWD: string;
		XDG_SESSION_DESKTOP: string;
		LOGNAME: string;
		QT_QPA_PLATFORMTHEME: string;
		XDG_SESSION_TYPE: string;
		PW_TEST_REPORTER_WS_ENDPOINT: string;
		PANEL_GDK_CORE_DEVICE_EVENTS: string;
		npm_config_init_module: string;
		VSCODE_CODE_CACHE_PATH: string;
		_: string;
		XAUTHORITY: string;
		XDG_GREETER_DATA_DIR: string;
		MOTD_SHOWN: string;
		GDM_LANG: string;
		GTK2_RC_FILES: string;
		HOME: string;
		LANG: string;
		LC_PAPER: string;
		XDG_CURRENT_DESKTOP: string;
		PLAYWRIGHT_TEST_BASE_URL: string;
		npm_package_version: string;
		VSCODE_IPC_HOOK: string;
		VSCODE_CLI: string;
		PW_TS_ESM_ON: string;
		XDG_SEAT_PATH: string;
		PW_TEST_HTML_REPORT_OPEN: string;
		INIT_CWD: string;
		DOTNET_BUNDLE_EXTRACT_BASE_DIR: string;
		CHROME_DESKTOP: string;
		npm_lifecycle_script: string;
		XDG_SESSION_CLASS: string;
		LC_IDENTIFICATION: string;
		npm_package_name: string;
		npm_config_prefix: string;
		USER: string;
		DISPLAY: string;
		npm_lifecycle_event: string;
		VSCODE_PID: string;
		SHLVL: string;
		LC_TELEPHONE: string;
		LC_MEASUREMENT: string;
		VSCODE_CWD: string;
		XDG_VTNR: string;
		UBUNTU_MENUPROXY: string;
		XDG_SESSION_ID: string;
		npm_config_user_agent: string;
		npm_execpath: string;
		XDG_RUNTIME_DIR: string;
		DEBUGINFOD_URLS: string;
		npm_package_json: string;
		LC_TIME: string;
		npm_config_legacy_peer_deps: string;
		ELECTRON_NO_ATTACH_CONSOLE: string;
		QT_AUTO_SCREEN_SCALE_FACTOR: string;
		GTK3_MODULES: string;
		XDG_DATA_DIRS: string;
		GDK_BACKEND: string;
		npm_config_noproxy: string;
		BROWSER: string;
		PATH: string;
		npm_config_metrics_registry: string;
		npm_config_node_gyp: string;
		GDMSESSION: string;
		ORIGINAL_XDG_CURRENT_DESKTOP: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		npm_config_global_prefix: string;
		VSCODE_NLS_CONFIG: string;
		MAIL: string;
		npm_node_execpath: string;
		npm_config_engine_strict: string;
		VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
		LC_NUMERIC: string;
		PW_TEST_CONNECT_WS_ENDPOINT: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: string]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
