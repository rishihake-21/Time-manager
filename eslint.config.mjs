import js from "@eslint/js";

export default [
  { ignores: [".next/", "node_modules/", "out/", "build/"] },
  {
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        localStorage: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        Response: "readonly",
        URL: "readonly",
        self: "readonly",
        caches: "readonly",
        clients: "readonly",
        process: "readonly",
        module: "readonly",
      },
    },
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];