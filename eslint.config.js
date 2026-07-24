import eslint from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      ".hugo_cache/**",
      ".report-work/**",
      "node_modules/**",
      "public/**",
      "resources/**",
    ],
  },
  eslint.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      sourceType: "module",
    },
    rules: {
      "no-useless-assignment": "off",
    },
  },
];
