const { test, expect } = require("@playwright/test");

test("spatial artwork loads near the viewport, responds to depth and suspends behind the menu", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("./");
  const frame = page.locator('[data-spatial="photo"]');
  const canvas = frame.locator("canvas");
  await expect(frame).not.toHaveAttribute("data-renderer");
  await frame.scrollIntoViewIfNeeded();
  await expect(frame).toHaveAttribute("data-ready", "true");
  await expect(canvas).toHaveAttribute("data-running", "true");
  await page.locator("#spatial-depth").fill("0");
  await expect(page.locator("#spatial-depth-value")).toHaveText("0");
  const still = await canvas.screenshot();
  await page.locator("#spatial-depth").fill("100");
  await frame.hover({ position: { x: 100, y: 100 } });
  await page.waitForTimeout(400);
  expect((await canvas.screenshot()).equals(still)).toBe(false);
  await page.locator("#chapters-toggle").click();
  await expect(canvas).toHaveAttribute("data-running", "false");
  await page.keyboard.press("Escape");
  await expect(canvas).toHaveAttribute("data-running", "true");
  await page.locator("#laboratorio").scrollIntoViewIfNeeded();
  await expect(canvas).toHaveAttribute("data-running", "false");
});

test("journey camera follows native scroll in both directions and stops when hidden", async ({
  page,
}) => {
  await page.goto("./");
  const stage = page.locator('[data-spatial="journey"]');
  const canvas = stage.locator("canvas");
  const seek = (progress) =>
    page.evaluate((p) => {
      const section = document.querySelector(".portal-journey");
      const stage = section.querySelector(".journey-stage");
      scrollTo(
        0,
        section.offsetTop + (section.offsetHeight - stage.offsetHeight) * p,
      );
    }, progress);
  await seek(0.1);
  await expect(stage).toHaveAttribute("data-ready", "true");
  await expect(canvas).toHaveAttribute("data-running", "true");
  await expect(page.locator("[data-journey-label]")).toHaveText("01 / ENTRAR");
  const start = await canvas.screenshot();
  await seek(0.8);
  await expect(page.locator("[data-journey-label]")).toHaveText(
    "03 / DESCUBRIR",
  );
  await page.waitForTimeout(400);
  expect((await canvas.screenshot()).equals(start)).toBe(false);
  await seek(0.45);
  await expect(page.locator("[data-journey-label]")).toHaveText(
    "02 / ATRAVESAR",
  );
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(canvas).toHaveAttribute("data-running", "false");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(canvas).toHaveAttribute("data-running", "true");
  await page.getByRole("link", { name: /Ir al laboratorio/ }).click();
  await expect(page).toHaveURL(/#laboratorio$/);
  await expect(canvas).toHaveAttribute("data-running", "false");
});

test("WebGL failure preserves the artwork, narrative and native navigation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, options) {
      return type === "webgl2" ? null : original.call(this, type, options);
    };
  });
  await page.goto("./");
  await page.locator(".spatial-frame").scrollIntoViewIfNeeded();
  await expect(page.locator(".spatial-frame img")).toBeVisible();
  await expect(page.locator(".spatial-frame")).toHaveAttribute(
    "data-renderer",
    "fallback",
  );
  await page.locator("#recorrido").scrollIntoViewIfNeeded();
  await expect(page.locator(".journey-fallback")).toBeVisible();
  await expect(page.locator("#journey-title")).toBeVisible();
  await page.getByRole("link", { name: /Ir al laboratorio/ }).click();
  await expect(page).toHaveURL(/#laboratorio$/);
});

test("touch layout keeps native vertical gestures, depth controls and no horizontal overflow", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4179/SkuuIll/");
    await page.locator(".spatial-frame").scrollIntoViewIfNeeded();
    await expect(page.locator(".spatial-frame")).toHaveAttribute(
      "data-ready",
      "true",
    );
    await page.locator("#spatial-depth").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#spatial-depth-value")).toHaveText("51");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    expect(
      await page
        .locator(".spatial-frame")
        .evaluate((e) => getComputedStyle(e).touchAction),
    ).toBe("auto");
  } finally {
    await context.close();
  }
});
