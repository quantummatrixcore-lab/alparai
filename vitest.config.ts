import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import { availableParallelism, cpus } from "node:os";

const coreCount = typeof availableParallelism === "function" ? availableParallelism() : cpus().length;
// Optimize worker allocation for Windows to maximize throughput while avoiding memory exhaustion
const maxWorkers = Math.max(1, Math.min(coreCount, 4));

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
      "server-only": resolve(import.meta.dirname, "src/lib/__mocks__/server-only.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    testTimeout: 30000,
    hookTimeout: 45000,
    setupFiles: ["./vitest.setup.ts"],
    fileParallelism: true,
    maxWorkers,
    maxConcurrency: 5,
    include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["tests/e2e/**", "node_modules/**", "dist-public/**"],
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
