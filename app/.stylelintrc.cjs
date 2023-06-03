module.exports = {
	extends: ["stylelint-config-standard", "stylelint-prettier/recommended"],
	customSyntax: require("postcss-html")({ css: "postcss-safe-parser" }),
};
