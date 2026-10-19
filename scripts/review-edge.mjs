import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const base = process.env.REVIEW_URL || "http://127.0.0.1:4179/SkuuIll/";
mkdirSync(".qa/cinema", { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });
const results = [];
try {
  for (const [width, height, theme] of [
    [1440, 900, "light"],
    [1280, 720, "dark"],
    [390, 844, "light"],
    [768, 1024, "dark"],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      colorScheme: theme,
    });
    await context.addInitScript(
      (theme) => localStorage.setItem("skull-theme", theme),
      theme,
    );
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base);
    if (await page.locator("#boot-intro").isVisible())
      await page.screenshot({
        path: `.qa/cinema/edge-${width}-${theme}-intro.png`,
      });
    await page.waitForFunction(
      () => document.querySelector("video")?.currentTime > 0.15,
    );
    const video = await page.locator("video").evaluate((v) => ({
      width: v.videoWidth,
      time: v.currentTime,
      paused: v.paused,
    }));
    assert.equal(video.width, 1280);
    assert.equal(video.paused, false);
    assert.equal(await page.locator("html").getAttribute("data-theme"), theme);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({ path: `.qa/cinema/edge-${width}-${theme}.png` });
    await page
      .getByRole("button", { name: "Pausar experiencia", exact: true })
      .click();
    assert.equal(await page.locator("video").evaluate((v) => v.paused), true);
    await page
      .getByRole("button", { name: "Activar experiencia", exact: true })
      .click();
    await page
      .locator(width > 1100 ? "#chapters-toggle" : ".menu-toggle")
      .click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `.qa/cinema/edge-${width}-${theme}-menu.png`,
    });
    assert.equal(await page.locator("video").evaluate((v) => v.paused), true);
    await page.keyboard.press("Escape");
    await page.evaluate(() => scrollTo(0, 500));
    await page.waitForTimeout(800);
    assert.ok(
      Math.abs(
        await page
          .locator(".cinema-hero")
          .evaluate((e) => e.getBoundingClientRect().top),
      ) < 2,
    );
    await page.screenshot({
      path: `.qa/cinema/edge-${width}-${theme}-scroll.png`,
    });
    await page.getByRole("tab", { name: /Vigía/ }).click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `.qa/cinema/edge-${width}-${theme}-deck.png`,
    });
    await page.getByRole("tab", { name: /Aplicaciones/ }).click();
    assert.ok(
      (await page.getByRole("tabpanel").textContent()).includes(
        "Más posibilidades",
      ),
    );
    await page.locator(".hotel-composition").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `.qa/cinema/edge-${width}-${theme}-hotel.png`,
    });
    assert.deepEqual(errors, []);
    results.push({ width, height, theme, video, errors });
    await context.close();
  }
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  const media = [];
  page.on("request", (r) => {
    if (r.url().endsWith(".webm")) media.push(r.url());
  });
  await page.goto(base);
  await page
    .locator(".cinema-status")
    .filter({ hasText: "Movimiento reducido por el sistema" })
    .waitFor();
  assert.deepEqual(media, []);
  const report = {
    url: base,
    browser: browser.version(),
    results,
    reducedMotionNoVideo: true,
  };
  writeFileSync(
    ".qa/cinema/edge-results.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
