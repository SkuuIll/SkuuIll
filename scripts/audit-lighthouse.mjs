import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
mkdirSync(".qa", { recursive: true });
const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ["--headless", "--disable-dev-shm-usage"],
});
try {
  const { lhr } = await lighthouse("http://127.0.0.1:4179/SkuuIll/", {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  });
  writeFileSync(
    ".qa/lighthouse-mobile.json",
    JSON.stringify(lhr, null, 2),
  );
  const summary = {
    scores: Object.fromEntries(
      Object.entries(lhr.categories).map(([id, category]) => [
        id,
        Math.round(category.score * 100),
      ]),
    ),
    metrics: Object.fromEntries(
      [
        "largest-contentful-paint",
        "cumulative-layout-shift",
        "total-blocking-time",
        "first-contentful-paint",
      ].map((id) => [id, lhr.audits[id]?.displayValue]),
    ),
    opportunities: Object.values(lhr.audits)
      .filter(
        (a) =>
          a.score !== null &&
          a.score < 0.9 &&
          a.details?.type === "opportunity",
      )
      .map((a) => ({ id: a.id, title: a.title, displayValue: a.displayValue })),
  };
  writeFileSync(
    ".qa/lighthouse-summary.json",
    JSON.stringify(summary, null, 2),
  );
  console.log(JSON.stringify(summary, null, 2));
} finally {
  await chrome.kill();
}
