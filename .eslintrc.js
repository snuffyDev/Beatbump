module.exports = {
	root: true,
	extends: ['eslint:recommended', 'prettier'],
	plugins: ['svelte3'],
	overrides: [
		{ files: ['*.svelte'], processor: 'svelte3/svelte3' },
		// For *.cjs, set env to node to remove the require() complaints.
		{ files: ['*.cjs'], env: { node: true } }
	],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2018
	},
	env: {
		browser: true
	}
}
