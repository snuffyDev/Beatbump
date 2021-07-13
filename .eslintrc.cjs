// module.exports = {
// 	root: true,
// 	extends: ['eslint:recommended', 'prettier'],
// 	plugins: ['svelte3'],
// 	overrides: [
// 		{ files: ['*.svelte'], processor: 'svelte3/svelte3' },
// 		// For *.cjs, set env to node to remove the require() complaints.
// { files: ['*.cjs'], env: { node: true } }
// 	],
// 	parserOptions: {
// 		sourceType: 'module',
// 		ecmaVersion: 2018
// 	},
// 	env: {
// 		browser: true
// 	}
// }
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	plugins: ['svelte3', '@typescript-eslint'],
	ignorePatterns: ['*.cjs'],
	overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }, { files: ['*.cjs'], env: { node: true } }
	],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2019
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
};
