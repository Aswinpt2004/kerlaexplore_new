import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        localStorage: "readonly",
        document: "readonly",
        window: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        navigator: "readonly",
        fetch: "readonly",
        ImportMeta: "readonly",
        React: "readonly",
        HTMLImageElement: "readonly",
        HTMLDivElement: "readonly",
        KeyboardEvent: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": ts,
      "react-hooks": reactHooks,
    },
    rules: {
      ...ts.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "no-empty": "off",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "eslint.config.js"],
  },
];
