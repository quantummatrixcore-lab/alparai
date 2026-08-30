import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "dist-public/**",
      "node_modules/**",
      "public/**",
      ".vercel/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "scripts/**",
      ".browser_profile/**",
      "scratch/**",
      "chrome-profile/**",
      "tmp/**",
      "tmp-qa/**",
      ".agents/**",
      "ops/**",
      "chrome-data/**",
      "graphify-out/**",
      "**/*.js",
      "**/*.cjs",
      "**/*.mjs",
      "src/types/database.ts",
      "**/.*",
      "**/.mock*"
    ]
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "off",
      "react-hooks/set-state-in-effect": "off",
      "@next/next/no-img-element": "off",
    },
  }
];

export default eslintConfig;
