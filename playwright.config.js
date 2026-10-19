const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4179/SkuuIll/",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run serve:test",
    url: "http://127.0.0.1:4179/SkuuIll/",
    reuseExistingServer: !process.env.CI,
  },
});
