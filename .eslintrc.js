module.exports = {
	"root": true,
	"extends": "eslint:recommended",
	"env": {
		"browser": true,
		"es6": true,
		"jquery": true,
		"webextensions": true,
	},
	"parserOptions": {
		"ecmaVersion": 6,
	},
	"rules": {
		"block-scoped-var": "error",
		"block-spacing": "error",
		"brace-style": ["error", "stroustrup"],
		"comma-dangle": ["error", "always-multiline"],
		"eol-last": ["error", "always"],
		"indent": ["error", "tab"],
		"linebreak-style": ["error", "unix"],
		"no-array-constructor": "error",
		"no-console": "off",
		"no-constant-condition": "error",
		"no-duplicate-imports": "error",
		"no-multiple-empty-lines": "error",
		"no-new-object": "error",
		"no-trailing-spaces": "error",
		"no-use-before-define": ["error", { "functions": false, "classes": true, "variables": true }],
		"no-var": "error",
		"prefer-numeric-literals": "error",
		"semi": ["error", "always"],
		"strict": ["error", "global"],
		"unicode-bom": ["error", "never"],
	},
};
