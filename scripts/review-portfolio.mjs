import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
const output = ".qa/visual-review";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [390, 768, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://127.0.0.1:4179/SkuuIll/");
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${output}/hero-${width}.png` });
    await page.screenshot({
      path: `${output}/home-${width}.png`,
      fullPage: true,
    });
    results.push({
      width,
      errors,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    });
    await page.close();
  }
  writeFileSync(`${output}/findings.json`, JSON.stringify(results, null, 2));
  console.log(results);
} finally {
  await browser.close();
}
