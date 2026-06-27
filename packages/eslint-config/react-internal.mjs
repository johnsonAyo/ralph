import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { baseConfig } from "./base.mjs";

/**
 * Shared ESLint flat config for React / Next.js code (apps/web, packages/ui).
 * Extends the base TypeScript config with React + hooks rules.
 */
export const reactInternalConfig = [
  ...baseConfig,
  {
    files: ["**/*.{ts,tsx,jsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react: reactPlugin, "react-hooks": reactHooks },
    settings: { react: { version: "detect" } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
];

export default reactInternalConfig;
