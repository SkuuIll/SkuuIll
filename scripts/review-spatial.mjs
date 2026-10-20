import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";

const output = process.env.REVIEW_OUTPUT || ".qa/spatial";
const url = process.env.REVIEW_URL || "http://127.0.0.1:4179/SkuuIll/";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });
const results = [];
try {
  for (const [width, height, theme] of [
    [360, 800, "dark"],
    [390, 844, "light"],
    [768, 1024, "dark"],
    [1280, 720, "light"],
    [1440, 1000, "dark"],
    [1920, 1080, "light"],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    const errors = [],
      requests = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    page.on("request", (request) => requests.push(request.url()));
    await page.addInitScript((theme) => {
      localStorage.setItem("skull-theme", theme);
      localStorage.setItem("skull-motion-mode", "reduced");
    }, theme);
    await page.goto(url, { waitUntil: "networkidle" });
    assert.equal(
      await page.locator("html").getAttribute("data-effects"),
      "full",
    );
    assert.equal(
      await page
        .locator("#enable-effects,#motion-mode,#motion-status,.motion-toolbar")
        .count(),
      0,
    );
    const initialThree = requests.some((url) => /three\.module/.test(url));
    assert.equal(initialThree, false);
    await page.screenshot({ path: `${output}/${width}-${theme}-hero.png` });
    await page.locator(".spatial-frame").scrollIntoViewIfNeeded();
    await page.waitForFunction(
      () => document.querySelector(".spatial-frame").dataset.ready === "true",
    );
    await page.waitForTimeout(750);
    await page.screenshot({ path: `${output}/${width}-${theme}-depth.png` });
    await page.evaluate(() => {
      const section = document.querySelector(".portal-journey");
      scrollTo(
        0,
        section.offsetTop + (section.offsetHeight - innerHeight) * 0.48,
      );
    });
    await page.waitForFunction(
      () => document.querySelector(".journey-stage").dataset.ready === "true",
    );
    await page.waitForTimeout(750);
    await page.screenshot({ path: `${output}/${width}-${theme}-journey.png` });
    await page
      .locator('.site-header button[aria-controls="mobile-nav"]:visible')
      .click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${output}/${width}-${theme}-menu.png` });
    await page.keyboard.press("Escape");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    assert.equal(overflow, false);
    assert.deepEqual(errors, []);
    results.push({
      width,
      height,
      theme,
      initialThree,
      overflow,
      errors,
      features: await page.evaluate(() => ({
        scopedTransitions: "startViewTransition" in HTMLElement.prototype,
        scrollTimeline: CSS.supports("animation-timeline", "view()"),
        squircle: CSS.supports("corner-shape", "squircle"),
      })),
      scenes: await page.locator("[data-spatial]").evaluateAll((elements) =>
        elements.map((element) => ({
          kind: element.dataset.spatial,
          renderer: element.dataset.renderer,
        })),
      ),
    });
    await page.close();
  }
  writeFileSync(
    `${output}/edge-results.json`,
    JSON.stringify({ url, browser: browser.version(), results }, null, 2),
  );
  console.log(
    JSON.stringify({ url, browser: browser.version(), results }, null, 2),
  );
} finally {
  await browser.close();
}
