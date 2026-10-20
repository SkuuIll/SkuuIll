import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
const output = ".qa/spulp";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });
const url = process.env.REVIEW_URL || "http://127.0.0.1:4179/SkuuIll/";
const results = [];
try {
  for (const [width, height, theme] of [
    [360, 800, "dark"],
    [390, 844, "light"],
    [768, 1024, "dark"],
    [1280, 720, "dark"],
    [1440, 1000, "dark"],
    [1920, 1080, "light"],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "no-preference",
    });
    await page.addInitScript(
      (theme) => localStorage.setItem("skull-theme", theme),
      theme,
    );
    const errors = [];
    const requests = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    page.on("request", (request) => requests.push(request.url()));
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${output}/edge-${width}-${theme}.png` });
    const hero = await page.locator(".sp-actions").boundingBox();
    const initial = await page.evaluate(() =>
      performance.getEntriesByType("resource").map((r) => ({
        url: r.name,
        bytes: r.decodedBodySize,
        type: r.initiatorType,
      })),
    );
    const scripts = await page.evaluate(() =>
      [...document.scripts].filter((s) => s.src).map((s) => s.src),
    );
    let scriptGzipBytes = 0;
    for (const script of scripts) {
      const response = await page.request.get(script);
      scriptGzipBytes += gzipSync(await response.body()).length;
    }
    const timing = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const deltas = [];
          let last = performance.now();
          const until = last + 700;
          function step(now) {
            deltas.push(now - last);
            last = now;
            if (now < until) requestAnimationFrame(step);
            else
              resolve({
                samples: deltas.length,
                averageIntervalMs:
                  deltas.reduce((a, b) => a + b, 0) / deltas.length,
              });
          }
          requestAnimationFrame(step);
        }),
    );
    await page
      .locator("#secuencia")
      .evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(400);
    await page.screenshot({
      path: `${output}/edge-${width}-${theme}-scroll.png`,
    });
    for (const tab of await page.getByRole("tab").all()) {
      await tab.click();
      await page.screenshot({
        path: `${output}/edge-${width}-${theme}-${await tab.getAttribute("id")}.png`,
      });
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page
      .locator(width < 768 ? ".menu-toggle" : "#chapters-toggle")
      .click();
    await page.screenshot({
      path: `${output}/edge-${width}-${theme}-menu.png`,
    });
    await page.keyboard.press("Escape");
    results.push({
      width,
      height,
      theme,
      errors,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      primaryActionWithinFirstScreen: hero.y + hero.height <= height,
      initialResourceBytes: initial.reduce((sum, r) => sum + r.bytes, 0),
      entryScriptsGzipBytes: scriptGzipBytes,
      requestedVideo: requests.some((url) => /\.webm|\.mp4/.test(url)),
      timing,
    });
    await page.close();
  }
  const reduced = await browser.newPage({ reducedMotion: "reduce" });
  await reduced.goto(url);
  const before = await reduced.locator("html").getAttribute("data-effects");
  await reduced.waitForFunction(
    () => document.querySelector("#signal-canvas").dataset.running === "true",
  );
  results.push({
    reducedSystem: before,
    manualFull: await reduced.locator("html").getAttribute("data-effects"),
  });
  await reduced.close();
  writeFileSync(
    `${output}/edge-results.json`,
    JSON.stringify({ browser: browser.version(), url, results }, null, 2),
  );
  console.log(
    JSON.stringify({ browser: browser.version(), url, results }, null, 2),
  );
  if (
    results.some(
      (result) =>
        result.errors?.length ||
        result.overflow ||
        result.primaryActionWithinFirstScreen === false,
    )
  )
    process.exitCode = 1;
} finally {
  await browser.close();
}
