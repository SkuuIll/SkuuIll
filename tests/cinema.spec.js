const { test, expect } = require("@playwright/test");

test("data saving leaves the film unloaded until explicitly requested", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "connection", {
      value: { saveData: true },
      configurable: true,
    }),
  );
  await page.goto("./");
  await expect(page.locator(".cinema-status")).toHaveText("Fondo en pausa");
  await expect(page.locator(".cinema-film")).not.toHaveAttribute("src", /webm/);
  await page
    .getByRole("button", { name: "Reproducir fondo", exact: true })
    .click();
  await expect
    .poll(() => page.locator(".cinema-film").evaluate((v) => v.currentTime))
    .toBeGreaterThan(0.1);
});

test("film decodes, pauses offscreen and shares the persistent motion preference", async ({
  page,
}) => {
  await page.goto("./");
  const film = page.locator(".cinema-film");
  await expect
    .poll(() => film.evaluate((v) => v.currentTime))
    .toBeGreaterThan(0.2);
  expect(await film.evaluate((v) => v.videoWidth)).toBe(1280);
  await page
    .getByRole("button", { name: "Pausar experiencia", exact: true })
    .click();
  await expect.poll(() => film.evaluate((v) => v.paused)).toBe(true);
  await expect(page.locator(".cinema-status")).toHaveText("Movimiento pausado");
  await page.reload();
  await expect(film).not.toHaveAttribute("src", /webm/);
  await page
    .getByRole("button", { name: "Activar experiencia", exact: true })
    .click();
  await expect.poll(() => film.evaluate((v) => v.paused)).toBe(false);
  await page.locator("#aplicaciones").scrollIntoViewIfNeeded();
  await expect.poll(() => film.evaluate((v) => v.paused)).toBe(true);
});

test("scroll pins the opening while the next chapter covers it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("./");
  const start = await page.locator(".cinema-cover").boundingBox();
  await page.evaluate(() => scrollTo(0, 500));
  await expect
    .poll(() =>
      page
        .locator(".cinema-hero")
        .evaluate((e) => Math.abs(e.getBoundingClientRect().top)),
    )
    .toBeLessThan(2);
  const cover = await page.locator(".cinema-cover").boundingBox();
  expect(cover.y).toBeLessThan(start.y - 400);
  expect(
    await page
      .locator(".cinema-media")
      .evaluate((e) => getComputedStyle(e).transform),
  ).not.toBe("none");
  await page.getByRole("link", { name: /02 \/ ECOSISTEMA/ }).click();
  await expect(page).toHaveURL(/#vigia$/);
});

test("reduced motion never requests the film and leaves the poster visible", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (r) => {
    if (r.url().endsWith(".webm")) requests.push(r.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await expect(page.locator(".cinema-status")).toHaveText(
    "Movimiento reducido por el sistema",
  );
  await expect(page.locator(".cinema-film")).not.toHaveAttribute("src", /webm/);
  await expect(page.locator(".cinema-media img")).toBeVisible();
  expect(requests).toEqual([]);
  await expect(page.locator(".cinema-hero")).not.toHaveAttribute(
    "style",
    /fixed/,
  );
});

test("a failed film keeps the static composition and navigation usable", async ({
  page,
}) => {
  await page.route("**/product-film.webm", (r) => r.abort());
  await page.goto("./");
  await expect(page.locator(".cinema-status")).toHaveText("Fondo estático");
  await expect(page.locator(".cinema-film")).not.toHaveClass(/is-ready/);
  await page
    .getByRole("link", { name: "Explorá mi trabajo", exact: false })
    .click();
  await expect(page).toHaveURL(/#trabajo$/);
});

test("blocked autoplay offers an explicit playback button", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    let first = true;
    HTMLMediaElement.prototype.play = function () {
      if (first) {
        first = false;
        return Promise.reject(new DOMException("Blocked", "NotAllowedError"));
      }
      return original.call(this);
    };
  });
  await page.goto("./");
  await page
    .getByRole("button", { name: "Reproducir fondo", exact: true })
    .click();
  await expect
    .poll(() => page.locator(".cinema-film").evaluate((v) => v.currentTime))
    .toBeGreaterThan(0.1);
  await expect(page.locator("#film-play")).toBeHidden();
});
