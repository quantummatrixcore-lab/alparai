import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "server-only": resolve(__dirname, "src/lib/__mocks__/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    testTimeout: 15000,
    hookTimeout: 30000,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/types/**",
        "src/**/*.d.ts",
        "src/app/[locale]/layout.tsx",
        "src/app/[locale]/not-found.tsx",
        "src/app/[locale]/error.tsx",
        "src/app/[locale]/loading.tsx",
        "src/app/**/error.tsx",
        "src/app/**/loading.tsx",
        "src/app/**/not-found.tsx",
        "src/components/ui/**",
        "src/hooks/**",
        "src/i18n/**",
        "src/content/**",
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85,
      },
    },
  },
});
