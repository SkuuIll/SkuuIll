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
  await page.locator("#motion-mode").selectOption("reduced");
  await expect(page.locator("#signal-canvas")).toHaveAttribute(
    "data-running",
    "false",
  );
  await expect(page.locator("#motion-status")).toHaveText(
    "Movimiento reducido",
  );
  await page.reload();
  await expect(page.locator("#motion-mode")).toHaveValue("reduced");
  await page.locator("#motion-mode").selectOption("full");
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
  await page.locator("#motion-mode").selectOption("reduced");
  const before = await canvas.evaluate((c) => c.toDataURL());
  await page.mouse.move(1200, 400);
  await page.waitForTimeout(100);
  expect(await canvas.evaluate((c) => c.toDataURL())).toBe(before);
  await page.locator("#motion-mode").selectOption("full");
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

test("removed pause controls cannot leave a legacy session stuck", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("test-pause-seeded")) {
      sessionStorage.setItem("skull-motion", "paused");
      sessionStorage.setItem("test-pause-seeded", "true");
    }
  });
  await page.goto("./");
  await expect(page.locator(".motion-notice")).toBeVisible();
  await expect(page.locator("#scene-pause, #motion-toggle")).toHaveCount(0);
  await expect(page.locator("#motion-explanation")).toContainText(
    "movimiento reducido",
  );
  await page
    .getByRole("button", { name: "Activar animaciones", exact: false })
    .click();
  await expect(page.locator("#signal-canvas")).toHaveAttribute(
    "data-running",
    "true",
  );
  await expect(page.locator("#motion-mode")).toHaveValue("full");
  await expect(page.locator(".motion-notice")).toBeHidden();
  await page.reload();
  await expect(page.locator("#signal-canvas")).toHaveAttribute(
    "data-running",
    "true",
  );
});

test("legacy animation preference migrates without losing the visitor choice", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() =>
    localStorage.setItem("spulp-motion-mode", "full"),
  );
  await page.goto("./");
  await expect(page.locator("#motion-mode")).toHaveValue("full");
  await expect(page.locator("#signal-canvas")).toHaveAttribute(
    "data-running",
    "true",
  );
  await page.locator("#motion-mode").selectOption("reduced");
  await page.reload();
  await expect(page.locator("#motion-mode")).toHaveValue("reduced");
});

test("Skull branding is consistent and navigation remains compact", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("./");
  await expect(page).toHaveTitle(/Skull/);
  await expect(
    page.getByRole("link", { name: "Skull, inicio", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".hero-signature")).toContainText("Skull");
  expect(await page.locator("body").innerText()).not.toMatch(/Spulp/i);
  await expect(page.locator(".site-header button:visible")).toHaveCount(2);
  for (const route of ["proyectos/", "proyectos/cpaul/", "proyectos/vigia/"]) {
    await page.goto(route);
    await expect(page).toHaveTitle(/Skull/);
    expect(await page.locator("body").innerText()).not.toMatch(/Spulp/i);
  }
});

test("every load has a fresh composition and palette but preserves the chosen theme", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("skull-theme", "light"));
  await page.goto("./");
  let last = await page.locator("html").evaluate((root) => ({
    palette: root.dataset.palette,
    scene: root.dataset.scene,
    seed: root.dataset.seed,
  }));
  for (let i = 0; i < 4; i++) {
    await page.reload();
    const current = await page.locator("html").evaluate((root) => ({
      palette: root.dataset.palette,
      scene: root.dataset.scene,
      seed: root.dataset.seed,
    }));
    expect(current.palette).not.toBe(last.palette);
    expect(current.scene).not.toBe(last.scene);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    last = current;
  }
  await page.goto("proyectos/");
  expect(await page.locator("html").getAttribute("data-palette")).not.toBe(
    last.palette,
  );
  await page.goto("./");
  await expect(page.locator("#scene-pause,#motion-toggle")).toHaveCount(0);
});

test("glass surfaces have a real material and a solid alternative", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator(".glass-lens")).toBeVisible();
  const material = await page.locator(".glass-lens").evaluate((element) => ({
    filter: getComputedStyle(element).backdropFilter,
    shadow: getComputedStyle(element).boxShadow,
  }));
  expect(material.filter).not.toBe("none");
  expect(material.shadow).not.toBe("none");
  await page.locator("#material-mode").selectOption("solid");
  await expect(page.locator(".glass-lens")).toBeHidden();
  await page.reload();
  await expect(page.locator("#material-mode")).toHaveValue("solid");
  await page.locator("#material-mode").selectOption("glass");
  await expect(page.locator(".glass-lens")).toBeVisible();
  await page.emulateMedia({ contrast: "more" });
  await expect(page.locator(".glass-lens")).toBeHidden();
  expect(
    await page
      .locator(".site-header")
      .evaluate((element) => getComputedStyle(element).backdropFilter),
  ).toBe("none");
});

test("automatic glass honors transparency reduction while explicit glass can opt in", async ({
  page,
  context,
}) => {
  const devtools = await context.newCDPSession(page);
  await devtools.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
  });
  await page.goto("./");
  await expect(page.locator(".glass-lens")).toBeVisible();
  await page.locator("#material-mode").selectOption("auto");
  await expect(page.locator(".glass-lens")).toBeHidden();
  await page.locator("#material-mode").selectOption("glass");
  await expect(page.locator(".glass-lens")).toBeVisible();
});
