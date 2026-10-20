const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

test("complete motion explicitly overrides reduced OS preference and persists", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await expect(page.locator("html")).toHaveAttribute("data-effects", "reduced");
  await expect(page.locator("#signal-canvas")).toHaveAttribute(
    "data-running",
    "false",
  );
  await page.locator("#motion-mode").selectOption("full");
  await expect(page.locator("html")).toHaveAttribute("data-effects", "full");
  await expect(page.locator("#signal-canvas")).toHaveAttribute(
    "data-running",
    "true",
  );
  await page.reload();
  await expect(page.locator("#motion-mode")).toHaveValue("full");
  await page.locator("#scene-pause").click();
  await expect(page.locator("#signal-canvas")).toHaveAttribute(
    "data-running",
    "false",
  );
  await expect(page.locator("#motion-status")).toHaveText("En pausa");
  await page.reload();
  await expect(page.locator("#scene-pause")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator("#scene-pause").click();
  await expect(page.locator("#signal-canvas")).toHaveAttribute(
    "data-running",
    "true",
  );
});

test("scene responds to pointer and scroll, and stops offscreen and behind menu", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./");
  const canvas = page.locator("#signal-canvas");
  await expect(canvas).toHaveAttribute("data-running", "true");
  await page.locator("#scene-pause").click();
  const before = await canvas.evaluate((c) => c.toDataURL());
  await page.mouse.move(1200, 400);
  await page.waitForTimeout(100);
  expect(await canvas.evaluate((c) => c.toDataURL())).toBe(before);
  await page.locator("#scene-pause").click();
  await page.mouse.move(1200, 400);
  await page.waitForTimeout(150);
  expect(await canvas.evaluate((c) => c.toDataURL())).not.toBe(before);
  await page.locator("#chapters-toggle").click();
  await expect(canvas).toHaveAttribute("data-running", "false");
  await page.keyboard.press("Escape");
  await expect(canvas).toHaveAttribute("data-running", "true");
  await page.locator("#laboratorio").scrollIntoViewIfNeeded();
  await expect(canvas).toHaveAttribute("data-running", "false");
  await page.evaluate(() => scrollTo(0, 0));
  await expect(canvas).toHaveAttribute("data-running", "true");
});

test("context loss preserves vector fallback and recovery restarts the field", async ({
  page,
}) => {
  await page.goto("./");
  await page.locator("#motion-mode").selectOption("full");
  await page
    .locator("#signal-canvas")
    .evaluate((c) =>
      c.dispatchEvent(new Event("contextlost", { cancelable: true })),
    );
  await expect(page.locator(".signal-stage")).not.toHaveClass(/is-ready/);
  await expect(page.locator("#signal-canvas")).toHaveAttribute(
    "data-running",
    "false",
  );
  await page
    .locator("#signal-canvas")
    .evaluate((c) => c.dispatchEvent(new Event("contextrestored")));
  await expect(page.locator(".signal-stage")).toHaveClass(/is-ready/);
  await expect(page.locator("#signal-canvas")).toHaveAttribute(
    "data-running",
    "true",
  );
});

test("a browser without canvas renders readable content and vector artwork", async ({
  page,
}) => {
  await page.addInitScript(
    () => (HTMLCanvasElement.prototype.getContext = () => null),
  );
  await page.goto("./");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".signal-fallback")).toBeVisible();
  await expect(page.locator(".signal-stage")).not.toHaveClass(/is-ready/);
  await page.getByRole("tab", { name: /Interfaces/ }).click();
  await expect(page.locator("#panel-interface")).toBeVisible();
});

test("lab supports keyboard navigation, density, arrangement, amplitude and interface states", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.locator("#density").fill("12");
  await expect(page.locator(".composition-art span:visible")).toHaveCount(144);
  await page.locator("#density").fill("4");
  await expect(page.locator(".composition-art span:visible")).toHaveCount(16);
  const before = await page
    .locator(".composition-art span")
    .first()
    .getAttribute("style");
  await page.locator("#layout-shuffle").click();
  expect(
    await page.locator(".composition-art span").first().getAttribute("style"),
  ).not.toBe(before);
  await page.getByRole("tab", { name: /Composición/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /Movimiento/ })).toBeFocused();
  await expect(page.locator("#panel-motion")).toBeVisible();
  await page.locator("#amplitude").fill("90");
  await expect(page.locator("#amplitude-value")).toHaveText("90");
  await page.getByRole("tab", { name: /Movimiento/ }).focus();
  await page.keyboard.press("End");
  await page.getByRole("button", { name: "Procesando", exact: true }).click();
  await expect(page.locator("#interface-status")).toContainText("Procesando");
  await page.getByRole("button", { name: "Completado", exact: true }).click();
  await expect(page.locator(".interface-art")).toHaveAttribute(
    "data-state",
    "done",
  );
  await page.getByRole("tab", { name: /Interfaces/ }).focus();
  await page.keyboard.press("Home");
  await expect(page.locator("#panel-composition")).toBeVisible();
});

test("full screen menu traps focus, Escape restores it and archive remains reachable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("./");
  const trigger = page.locator("#chapters-toggle");
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Explorar capítulos" });
  await expect(dialog).toBeVisible();
  expect((await dialog.boundingBox()).height).toBe(900);
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("link", { name: /Contacto/ })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog
    .getByRole("link", { name: "Archivo de proyectos", exact: true })
    .click();
  await expect(page).toHaveURL(/\/proyectos\/$/);
  await expect(page.locator("h1")).toContainText("Más formas");
});

test("no-JavaScript fallback keeps all experiments and email available", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4179/SkuuIll/");
    await expect(page.locator(".lab-tabs")).toBeHidden();
    for (const panel of await page.locator(".lab-panel").all())
      await expect(panel).toBeVisible();
    await expect(page.locator(".motion-toolbar")).toBeHidden();
    await expect(page.locator(".signal-fallback")).toBeVisible();
    await expect(page.locator(".email-link")).toHaveAttribute(
      "href",
      "mailto:moreappmix@gmail.com",
    );
  } finally {
    await context.close();
  }
});

for (const theme of ["dark", "light"])
  test(`all experiments and expanded navigation are accessible in ${theme}`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(
      (theme) => localStorage.setItem("skull-theme", theme),
      theme,
    );
    await page.goto("./");
    for (const tab of await page.getByRole("tab").all()) {
      await tab.click();
      const result = await new AxeBuilder({ page })
        .include(".lab-console")
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

test("automatic mode honors data saving and explicit full mode can opt in", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { saveData: true },
    }),
  );
  await page.goto("./");
  await expect(page.locator("#motion-status")).toHaveText("Ahorro de datos");
  await expect(page.locator("#signal-canvas")).toHaveAttribute(
    "data-running",
    "false",
  );
  await page.locator("#motion-mode").selectOption("full");
  await expect(page.locator("#signal-canvas")).toHaveAttribute(
    "data-running",
    "true",
  );
});

test("visibility changes stop and resume rendering without changing the preference", async ({
  page,
}) => {
  await page.goto("./");
  await page.locator("#motion-mode").selectOption("full");
  await expect(page.locator("#signal-canvas")).toHaveAttribute(
    "data-running",
    "true",
  );
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("#signal-canvas")).toHaveAttribute(
    "data-running",
    "false",
  );
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("#signal-canvas")).toHaveAttribute(
    "data-running",
    "true",
  );
  await expect(page.locator("#motion-mode")).toHaveValue("full");
});
