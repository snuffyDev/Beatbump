module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"prettier",
		"plugin:import/recommended",
		"plugin:import/no-cycle",
	],
	plugins: ["svelte3", "@typescript-eslint", "import"],
	ignorePatterns: ["*.cjs"],
	overrides: [
		{ files: ["*.svelte"], processor: "svelte3/svelte3" },
		{ files: ["*.cjs"], env: { node: true } },
	],
	settings: {
		"svelte3/typescript": () => require("typescript"),
		"svelte3/ignore-styles": () => true,
		"import/parsers": {
			"@typescript-eslint/parser": [".ts", ".tsx"],
		},
		"import/resolver": {
			typescript: {
				alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
			},
		},
	},
	parserOptions: {
		sourceType: "module",
		ecmaVersion: 2020,
	},
	env: {
		browser: true,
		es2020: true,
		node: true,
	},
};
