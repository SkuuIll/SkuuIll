import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://skuuill.github.io",
  base: "/SkuuIll",
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  devToolbar: { enabled: false },
});
