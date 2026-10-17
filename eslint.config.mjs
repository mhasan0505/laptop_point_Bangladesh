import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
  // Explicit legacy allow-list for pre-existing codebase files with un-migrated types:
  {
    files: [
      "lib/admin-dashboard.ts",
      "lib/products-storage.ts",
      "lib/media/storage.ts",
      "lib/media/presets.ts",
      "lib/power-deal-data.ts",
      "lib/questions-storage.ts",
      "lib/settings.ts",
      "lib/search-engine.ts",
      "lib/admin-users-storage.ts",
      "lib/banners/storage.ts",
      "lib/jobs/registry.ts",
      "lib/jobs/types.ts",
      "lib/media/upload-errors.ts",
      "lib/public-content.ts",
      "lib/admin-data.ts",
      "lib/admin-search.ts",
      "app/data/data.ts",
      "app/admin/inventory/page.tsx",
      "app/admin/power-deal/page.tsx",
      "app/admin/questions/page.tsx",
      "app/api/admin/power-deal/route.ts",
      "app/api/admin/search/route.ts",
      "app/api/admin/setup/credentials/route.ts",
      "app/api/admin/setup/masters/route.ts",
      "app/api/admin/setup/route.ts",
      "app/api/admin/upload/route.ts",
      "components/application/HeroSection.tsx",
      "components/home/HomeHero.tsx",
      "components/shop/FilterSidebar.tsx",
      "components/shop/ShopClient.tsx",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);

export default eslintConfig;
