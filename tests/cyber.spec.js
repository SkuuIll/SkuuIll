const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

test("the branded entrance can be skipped and appears only once per session", async ({
  page,
}) => {
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#boot-intro")).toBeVisible();
  await page.getByRole("button", { name: "Entrar al portafolio" }).click();
  await expect(page.locator("#boot-intro")).toBeHidden();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("#boot-intro")).toBeHidden();
  await expect(page.locator(".cinema-media img")).toHaveAttribute(
    "src",
    /skull-signal-poster/,
  );
});

test("reduced movement and direct chapter links bypass the entrance", async ({
  page,
}) => {
  await page.goto("./#atelier");
  await expect(page.locator("#boot-intro")).toBeHidden();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await expect(page.locator("#boot-intro")).toBeHidden();
  await expect(page.locator(".cinema-film")).not.toHaveAttribute("src", /webm/);
});

test("the full screen chapter menu traps focus, closes with Escape and follows real pages", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("./");
  const trigger = page.locator("#chapters-toggle");
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Explorar capítulos" });
  await expect(dialog).toBeVisible();
  const dimensions = await dialog.boundingBox();
  expect(dimensions.height).toBe(900);
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("link", { name: /Contacto/ })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(dialog).toBeHidden();
  await trigger.click();
  await dialog
    .getByRole("link", { name: "Archivo de proyectos", exact: true })
    .click();
  await expect(page).toHaveURL(/\/proyectos\/$/);
  await expect(page.locator("h1")).toContainText("Más formas");
});

test("project universes support mouse and arrow keyboard navigation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  const list = page.getByRole("tablist", { name: "Universos del trabajo" });
  const vigia = list.getByRole("tab", { name: /Vigía/ });
  await vigia.click();
  await expect(vigia).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toHaveCount(1);
  await expect(page.getByRole("tabpanel")).toContainText("Del campo");
  await page.keyboard.press("ArrowRight");
  await expect(list.getByRole("tab", { name: /Aplicaciones/ })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("Más posibilidades");
  await page.keyboard.press("Home");
  await expect(list.getByRole("tab", { name: /Atelier/ })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("Otra dimensión");
});

test("all universes remain readable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4179/SkuuIll/");
    await expect(page.locator(".deck-tabs")).toBeHidden();
    for (const panel of await page.locator(".deck-panel").all())
      await expect(panel).toBeVisible();
    await expect(page.locator("#boot-intro")).toBeHidden();
  } finally {
    await context.close();
  }
});

test("the background video pauses behind the full screen menu and resumes after closing", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("./");
  const video = page.locator(".cinema-film");
  await expect
    .poll(() => video.evaluate((v) => v.currentTime))
    .toBeGreaterThan(0.1);
  await page.locator("#chapters-toggle").click();
  await expect.poll(() => video.evaluate((v) => v.paused)).toBe(true);
  await page.keyboard.press("Escape");
  await expect.poll(() => video.evaluate((v) => v.paused)).toBe(false);
});

test("expanded chapter menu and every universe retain accessible contrast and semantics", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("./");
  for (const tab of await page.getByRole("tab").all()) {
    await tab.click();
    const result = await new AxeBuilder({ page })
      .include(".cyber-deck")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.failureSummary),
      })),
    ).toEqual([]);
  }
  await page.locator("#chapters-toggle").click();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.failureSummary),
    })),
  ).toEqual([]);
});
