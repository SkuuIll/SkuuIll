const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const catalog = require("../src/data/projects.json");

async function readyImages(page) {
  await page.evaluate(async () => {
    for (const image of document.images) image.loading = "eager";
    await Promise.all([...document.images].map((image) => image.decode()));
    await document.fonts.ready;
  });
}
async function prepareInquiry(page) {
  await page
    .getByText("Prefiero preparar una consulta", { exact: false })
    .click();
  await page.getByLabel("Tu nombre", { exact: true }).fill("María Pérez");
  await page.getByLabel("Tu email", { exact: true }).fill("maria@example.com");
  await page
    .getByLabel("¿Qué necesitás?", { exact: true })
    .selectOption("Aplicación web");
  await page
    .getByLabel("Contame tu idea", { exact: true })
    .fill(
      "Necesito un catálogo con filtros, variantes y consulta por WhatsApp.",
    );
  await page.getByRole("button", { name: "Preparar consulta" }).click();
}

for (const width of [360, 390, 768, 1440, 1920]) {
  test(`home resources and layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (
        response.url().startsWith("http://127.0.0.1:4179/") &&
        response.status() >= 400
      )
        errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto("./");
    await readyImages(page);
    await expect(page.locator("h1")).toContainText("Software");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const missingTargets = await page
      .locator('a[href^="#"]')
      .evaluateAll((links) =>
        links
          .map((link) => link.getAttribute("href").slice(1))
          .filter((id) => !document.getElementById(id)),
      );
    expect(missingTargets).toEqual([]);
    await expect(page.locator("#atelier-shot")).toBeVisible();
    await expect(page.locator(".application-row")).toHaveCount(8);
    expect(errors).toEqual([]);
  });
}

test("mobile menu supports keyboard, Escape and following a link", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  const toggle = page.locator(".menu-toggle");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(page.locator("#mobile-nav")).toBeHidden();
  await toggle.click();
  await page
    .locator("#mobile-nav")
    .getByRole("link", { name: "Trabajo" })
    .click();
  await expect(page).toHaveURL(/#trabajo$/);
  await expect(page.locator("#mobile-nav")).toBeHidden();
});

test("all project cases exist with visible content and correct canonical URLs", async ({
  page,
}) => {
  for (const project of catalog) {
    const errors = [];
    const listener = (error) => errors.push(error.message);
    page.on("pageerror", listener);
    const response = await page.goto(`proyectos/${project.id}/`);
    expect(response.status(), project.id).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".case-section").first()).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://skuuill.github.io/SkuuIll/proyectos/${project.id}/`,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      project.id,
    ).toBe(true);
    expect(errors, project.id).toEqual([]);
    page.off("pageerror", listener);
  }
});

test("catalog searches accents, filters categories and recovers from empty results", async ({
  page,
}) => {
  await page.goto("proyectos/");
  await expect(page.locator(".catalog-row:visible")).toHaveCount(
    catalog.length,
  );
  await page.getByRole("button", { name: "Android", exact: true }).click();
  const categories = await page
    .locator(".catalog-row:visible")
    .evaluateAll((rows) => rows.map((row) => row.dataset.category));
  expect(categories.length).toBeGreaterThan(0);
  expect(
    categories.every((category) => category.split(" ").includes("mobile")),
  ).toBe(true);
  await page.getByRole("button", { name: "Todos", exact: true }).click();
  await page.getByRole("searchbox").fill("vigia");
  await expect(page.locator("#project-count")).toContainText("3 de 21");
  await page.getByRole("searchbox").fill("sin-coincidencias-demo");
  await expect(
    page.getByRole("heading", { name: "No hay coincidencias." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Mostrar todos los proyectos" })
    .click();
  await expect(page.locator(".catalog-row:visible")).toHaveCount(
    catalog.length,
  );
  await expect(page.getByRole("searchbox")).toBeFocused();
});

test("old project links resolve under the repository hosting path", async ({
  page,
}) => {
  await page.goto("site/?caso=cpaul");
  await expect(page).toHaveURL(/\/SkuuIll\/proyectos\/cpaul\/$/);
  await page.goto("./?caso=vigia");
  await expect(page).toHaveURL(/\/SkuuIll\/proyectos\/vigia\/$/);
  await page.goto("site/?caso=unknown-case");
  await expect(page).toHaveURL(/\/SkuuIll\/proyectos\/#unknown-case$/);
});

test("Vigía scene selection works on mobile and with reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  for (const [index, name] of [
    "Supervisión GPS",
    "Personal",
    "Estado de habitaciones",
    "Compras",
  ].entries()) {
    await page.locator(`[data-scene-select="${index}"]`).click();
    await expect(
      page.locator(`[data-scene-select="${index}"]`),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('.scene-image[aria-hidden="false"]')).toHaveCount(
      1,
    );
    await expect(page.locator(".scene-image.is-active")).toHaveAttribute(
      "alt",
      new RegExp(name, "i"),
    );
  }
});

test("desktop scroll advances Vigía scenes and pause removes the long scroll sequence", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("./");
  await page.locator('[data-scene="2"]').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-scene-select="2"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page
    .getByRole("button", { name: "Pausar movimiento", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  await expect(page.locator(".vigia-story")).not.toHaveClass(/has-scenes/);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Activar movimiento" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("form rejects whitespace and invalidates a prepared message after edits", async ({
  page,
}) => {
  await page.goto("./");
  await page
    .getByText("Prefiero preparar una consulta", { exact: false })
    .click();
  await page.getByLabel("Tu nombre", { exact: true }).fill("   ");
  await page.getByRole("button", { name: "Preparar consulta" }).click();
  await expect(page.locator("#form-error")).toBeVisible();
  await page
    .getByText("Prefiero preparar una consulta", { exact: false })
    .click();
  await prepareInquiry(page);
  await expect(page.locator("#inquiry-result")).toBeVisible();
  const href = await page.locator("#email-draft").getAttribute("href");
  expect(href).toContain("mailto:moreappmix@gmail.com?");
  expect(decodeURIComponent(href)).toContain("María Pérez");
  await page
    .getByLabel("Contame tu idea")
    .fill("Ahora necesito otra propuesta con una integración de servicios.");
  await expect(page.locator("#inquiry-result")).toBeHidden();
  await expect(page.locator("#email-draft")).not.toHaveAttribute("href");
});

test("project inquiry preserves context and URL text cannot inject markup", async ({
  page,
}) => {
  await page.goto("proyectos/vigia/");
  await page.getByRole("link", { name: "Consultar por este trabajo" }).click();
  await page
    .getByText("Prefiero preparar una consulta", { exact: false })
    .click();
  await expect(page.getByLabel("Proyecto de referencia")).toHaveValue("Vigía");
  const payload = '<img src=x onerror=alert(1)> & "demo"';
  await page.goto(`./?proyecto=${encodeURIComponent(payload)}`);
  await page
    .getByText("Prefiero preparar una consulta", { exact: false })
    .click();
  await expect(page.getByLabel("Proyecto de referencia")).toHaveValue(payload);
  expect(await page.locator('img[src="x"]').count()).toBe(0);
});

test("clipboard fallback selects the message and the download contains the draft", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("blocked");
        },
      },
    }),
  );
  await page.goto("./");
  await prepareInquiry(page);
  await page.getByRole("button", { name: "Copiar mensaje" }).click();
  await expect(page.locator("#copy-status")).toContainText("Seleccioné");
  expect(
    await page
      .locator("#inquiry-message")
      .evaluate((input) => input.selectionEnd - input.selectionStart),
  ).toBeGreaterThan(30);
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar texto" }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("consulta-skull.txt");
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  expect(Buffer.concat(chunks).toString("utf8")).toContain("María Pérez");
});

test("content and email stay usable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4179/SkuuIll/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".email-link")).toHaveAttribute(
    "href",
    "mailto:moreappmix@gmail.com",
  );
  await expect(page.locator(".inquiry-details")).toBeHidden();
  await page.getByRole("link", { name: "Explorá el archivo completo" }).click();
  await expect(page.locator(".catalog-row")).toHaveCount(catalog.length);
  await page.locator("#nfile").click();
  await expect(page.locator(".case-content")).toContainText(
    /Senzme|fork|derivad/i,
  );
  await context.close();
});

test("palette changes on a new home visit and blocked storage does not break controls", async ({
  page,
}) => {
  await page.goto("./");
  const first = await page.locator("html").getAttribute("data-palette");
  const firstBackground = await page
    .locator("body")
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.reload();
  expect(await page.locator("html").getAttribute("data-palette")).not.toBe(
    first,
  );
  expect(
    await page
      .locator("body")
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  ).not.toBe(firstBackground);
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("blocked");
    };
    Storage.prototype.setItem = () => {
      throw new Error("blocked");
    };
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.reload();
  await page.locator("#palette-toggle").click();
  await page.locator("#motion-toggle").click();
  expect(errors).toEqual([]);
});

test("keyboard skip link and motion preference are respected", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Saltar al contenido" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#contenido$/);
  expect(
    await page
      .locator(".cinema-scroll > span")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
  await expect(page.locator(".vigia-story")).not.toHaveClass(/has-scenes/);
});

for (const palette of ["clay", "forest", "blue"]) {
  test(`home accessibility in ${palette} palette`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./");
    await readyImages(page);
    await page.evaluate(
      (palette) => (document.documentElement.dataset.palette = palette),
      palette,
    );
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        count: v.nodes.length,
        examples: v.nodes
          .slice(0, 4)
          .map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    ).toEqual([]);
  });
}

test("catalog, case and CV accessibility", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of ["proyectos/", "proyectos/vigia/"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        count: v.nodes.length,
        examples: v.nodes
          .slice(0, 4)
          .map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
      path,
    ).toEqual([]);
  }
});

test("private CV routes and files are absent from the public build", async ({
  request,
  page,
}) => {
  for (const route of [
    "cv/",
    "cv/Facundo-Escobedo-CV.pdf",
    "cv/Facundo-Escobedo-CV-ATS.pdf",
    "cv/Facundo-Escobedo-CV-Editable.html",
    "cv/Facundo-Escobedo-CV-ATS.html",
  ]) {
    expect((await request.get(route)).status()).toBe(404);
  }
  await page.goto("./");
  expect(await page.locator('a[href*="/cv/"]').count()).toBe(0);
  expect(await page.locator("body").innerText()).not.toMatch(
    /Escobedo|Profesorado|Electromecánico/,
  );
});
