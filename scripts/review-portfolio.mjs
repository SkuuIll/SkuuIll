import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
const output = ".qa/visual-review";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const findings = [];
try {
  for (const width of [390, 768, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (
        response.status() >= 400 &&
        response.url().startsWith("http://127.0.0.1:4179/")
      )
        errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto("http://127.0.0.1:4179/SkuuIll/", {
      waitUntil: "networkidle",
    });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => {
      for (const image of document.images) image.loading = "eager";
      await Promise.all([...document.images].map((image) => image.decode()));
    });
    await page.screenshot({ path: `${output}/hero-${width}.png` });
    await page.screenshot({
      path: `${output}/home-${width}.png`,
      fullPage: true,
    });
    findings.push({
      width,
      errors,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    });
    await page.close();
  }
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  await page.goto("http://127.0.0.1:4179/SkuuIll/proyectos/vigia/", {
    waitUntil: "networkidle",
  });
  await page.evaluate(async () => {
    for (const image of document.images) image.loading = "eager";
    await Promise.all([...document.images].map((image) => image.decode()));
  });
  await page.screenshot({ path: `${output}/case-vigia.png`, fullPage: true });
  await page.goto("http://127.0.0.1:4179/SkuuIll/cv/", {
    waitUntil: "networkidle",
  });
  await page.screenshot({ path: `${output}/cv-web.png`, fullPage: true });
  const moving = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
  });
  await moving.goto("http://127.0.0.1:4179/SkuuIll/", {
    waitUntil: "networkidle",
  });
  await moving.evaluate(async () => {
    for (const image of document.images) image.loading = "eager";
    await Promise.all([...document.images].map((image) => image.decode()));
  });
  for (const index of [0, 1, 2, 3]) {
    await moving.locator(`[data-scene="${index}"]`).evaluate(element=>element.scrollIntoView({block:'center'}));
    await moving.waitForFunction(
      (index) =>
        document
          .querySelector(`[data-scene-select="${index}"]`)
          .getAttribute("aria-pressed") === "true",
      index,
    );
    await moving.waitForFunction(index=>getComputedStyle(document.querySelectorAll('.scene-image')[index]).opacity==='1',index);
    await moving.screenshot({ path: `${output}/vigia-scene-${index + 1}.png` });
  }
  await moving.close();
  writeFileSync(`${output}/findings.json`, JSON.stringify(findings, null, 2));
  console.log(JSON.stringify(findings));
} finally {
  await browser.close();
}
