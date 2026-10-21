import { defineConfig } from "astro/config";

// Keep the existing project Pages URL by default, while allowing
// a user Pages deployment at https://skuuill.github.io/.
const deploymentBase = process.env.PORTFOLIO_BASE || "/SkuuIll";

export default defineConfig({
  site: "https://skuuill.github.io",
  base: deploymentBase,
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  devToolbar: { enabled: false },
});
