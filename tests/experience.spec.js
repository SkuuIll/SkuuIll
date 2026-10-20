const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
test("dark appearance and a chosen light appearance persist across pages", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("./");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("button", { name: "Activar modo claro", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.goto("proyectos/cpaul/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
test("Atelier gallery switches real screenshots with matching alternatives", async ({
  page,
}) => {
  await page.goto("proyectos/cpaul/");
  await page.getByRole("button", { name: /02 \/ Diseño y bordado/ }).click();
  await expect(page.locator("#atelier-shot")).toHaveAttribute(
    "src",
    /atelier-design.webp$/,
  );
  await expect(page.locator("#atelier-shot")).toHaveAttribute(
    "alt",
    /texto de demostración/,
  );
  await page.getByRole("button", { name: /03 \/ Ubicación/ }).click();
  await expect(page.locator("#atelier-shot")).toHaveAttribute(
    "src",
    /atelier-placement.webp$/,
  );
});
test("3D assets are requested on demand and failure preserves the static gallery", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (request) => {
    if (request.url().includes("/models/")) requests.push(request.url());
  });
  await page.goto("proyectos/cpaul/");
  expect(requests).toEqual([]);
  await page.route("**/models/**", (route) => route.abort());
  await page.getByRole("button", { name: "Activar muestra 3D" }).click();
  await expect(page.locator(".viewer-status")).toContainText(
    "no está disponible",
  );
  await expect(page.locator(".viewer-poster")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Activar muestra 3D" }),
  ).toBeEnabled();
});
test("3D model renders, accepts color and keyboard controls, and releases its canvas", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto("proyectos/cpaul/");
  await page.getByRole("button", { name: "Activar muestra 3D" }).click();
  await expect(page.locator(".viewer-status")).toContainText("3D lista", {
    timeout: 30000,
  });
  const canvas = page.locator(".viewer-stage canvas");
  await expect(canvas).toBeVisible();
  await page.getByRole("button", { name: "Oliva", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Oliva", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await page.getByRole("button", { name: "Acercar prenda" }).click();
  await page.getByRole("button", { name: "Cerrar 3D", exact: true }).click();
  await expect(canvas).toHaveCount(0);
  await expect(page.locator(".viewer-status")).toContainText("liberaron");
  await expect(
    page.getByRole("button", { name: "Activar muestra 3D" }),
  ).toBeFocused();
});
for (const theme of ["light", "dark"])
  for (const palette of ["clay", "forest", "blue"]) {
    test(`appearance accessibility ${theme} ${palette}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript(
        (theme) => localStorage.setItem("skull-theme", theme),
        theme,
      );
      await page.goto("./");
      await page.evaluate(
        (palette) => (document.documentElement.dataset.palette = palette),
        palette,
      );
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      ).toEqual([]);
    });
  }
test("home demonstrates skills and keeps projects in the archive", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator(".lab-panel")).toHaveCount(3);
  await expect(page.locator(".process-steps article")).toHaveCount(4);
  await expect(page.locator("#atelier-shot")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Explorá el archivo completo" }),
  ).toHaveAttribute("href", "/SkuuIll/proyectos/");
});
for (const theme of ["light", "dark"]) {
  test(`internal pages retain accessible appearance in ${theme} mode`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(
      (theme) => localStorage.setItem("skull-theme", theme),
      theme,
    );
    for (const route of [
      "proyectos/",
      "proyectos/cpaul/",
      "proyectos/vigia/",
    ]) {
      await page.goto(route);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        result.violations.map((v) => ({
          route,
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      ).toEqual([]);
    }
  });
}
test("static product presentation remains available without JavaScript in dark mode", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    colorScheme: "dark",
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4179/SkuuIll/proyectos/cpaul/");
  await expect(page.locator("#atelier-shot")).toBeVisible();
  await expect(page.locator(".viewer-poster")).toBeVisible();
  expect(
    await page
      .locator("body")
      .evaluate((e) => getComputedStyle(e).backgroundColor),
  ).not.toBe("rgb(244, 242, 236)");
  await context.close();
});
