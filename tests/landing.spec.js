const { test, expect } = require("@playwright/test");

async function fillInquiry(page) {
  await page.getByLabel("Tu nombre").fill("María Pérez");
  await page.getByLabel("Tu email").fill("maria@example.com");
  await page.getByLabel("¿Qué necesitás?").selectOption("Aplicación web");
  await page
    .getByLabel("Contame tu idea")
    .fill("Quiero una aplicación para administrar mi catálogo de productos.");
}

for (const width of [320, 390, 768, 1440]) {
  test(`navigation and layout at ${width}px`, async ({ page }) => {
    const errors = [];
    const failedRequests = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("requestfailed", (request) => failedRequests.push(request.url()));
    page.on("response", (response) => {
      if (response.status() >= 400) failedRequests.push(response.url());
    });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("./");
    await expect(page).toHaveTitle(/Skull/);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const missingTargets = await page
      .locator('a[href^="#"]')
      .evaluateAll((links) =>
        links
          .map((link) => link.getAttribute("href"))
          .filter((hash) => !document.getElementById(hash.slice(1))),
      );
    expect(missingTargets).toEqual([]);
    await page.getByRole("link", { name: "Hablemos" }).click();
    await expect(page).toHaveURL(/#contacto$/);
    expect(errors).toEqual([]);
    expect(failedRequests).toEqual([]);
    if (width === 390 || width === 1440) {
      await page.goto("./");
      await page.screenshot({
        path: `test-results/landing-${width}.png`,
        fullPage: true,
      });
    }
  });
}

test("required fields, whitespace validation and recovery", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Preparar consulta" }).click();
  await expect(page.locator("#inquiry-result")).toBeHidden();
  await fillInquiry(page);
  await page.getByLabel("Tu email").fill("invalid-email");
  await page.getByRole("button", { name: "Preparar consulta" }).click();
  await expect(page.locator("#inquiry-result")).toBeHidden();
  await page.getByLabel("Tu email").fill("maria@example.com");
  await page.getByLabel("Contame tu idea").fill("                         ");
  await page.getByRole("button", { name: "Preparar consulta" }).click();
  await expect(page.locator("#inquiry-result")).toBeHidden();
  await fillInquiry(page);
  await page.getByRole("button", { name: "Preparar consulta" }).click();
  await expect(page.locator("#inquiry-result")).toBeVisible();
});

test("project CTA prepares a draft, encodes special characters and invalidates stale content", async ({
  page,
}) => {
  await page.goto("./");
  await page.locator('[data-project="Pipa_arg"]').click();
  await expect(page.getByLabel("Proyecto de referencia")).toHaveValue(
    "Pipa_arg",
  );
  await expect(page.getByLabel("¿Qué necesitás?")).toHaveValue(
    "Sitio web o landing",
  );
  await fillInquiry(page);
  await page
    .getByLabel("Contame tu idea")
    .fill(
      "Mi idea tiene ñ, & y signos: quiero una tienda <especial> para mi marca.",
    );
  await page.getByRole("button", { name: "Preparar consulta" }).click();
  await expect(page.getByLabel("Mensaje preparado")).toHaveValue(
    /Referencia: Pipa_arg/,
  );
  const mailto = new URL(
    await page.locator("#email-draft").getAttribute("href"),
  );
  expect(mailto.protocol).toBe("mailto:");
  expect(mailto.pathname).toBe("moreappmix@gmail.com");
  expect(mailto.searchParams.get("body")).toContain("ñ, & y signos");
  expect(mailto.searchParams.get("body")).toContain("<especial>");
  expect(mailto.searchParams.get("subject")).toBe(
    "Consulta de proyecto — Aplicación web",
  );
  await expect(page.locator("#inquiry-result")).toBeFocused();
  await page.getByLabel("Tu nombre").fill("Otra persona");
  await expect(page.locator("#inquiry-result")).toBeHidden();
});

test("download contains the prepared inquiry without sending it", async ({
  page,
}) => {
  await page.goto("./");
  await fillInquiry(page);
  await page.getByRole("button", { name: "Preparar consulta" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar .txt" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("consulta-proyecto-skuuill.txt");
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  expect(Buffer.concat(chunks).toString("utf8")).toBe(
    await page.getByLabel("Mensaje preparado").inputValue(),
  );
});

test("clipboard failure selects the text and explains the fallback", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("Denied")) },
    }),
  );
  await page.goto("./");
  await fillInquiry(page);
  await page.getByRole("button", { name: "Preparar consulta" }).click();
  await page.getByRole("button", { name: "Copiar consulta" }).click();
  await expect(page.locator("#form-status")).toContainText("manualmente");
  expect(
    await page
      .getByLabel("Mensaje preparado")
      .evaluate(
        (field) =>
          field.selectionEnd - field.selectionStart === field.value.length,
      ),
  ).toBe(true);
});

test("clipboard success copies the complete inquiry", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text) => {
          window.copiedText = text;
        },
      },
    }),
  );
  await page.goto("./");
  await fillInquiry(page);
  await page.getByRole("button", { name: "Preparar consulta" }).click();
  await page.getByRole("button", { name: "Copiar consulta" }).click();
  await expect(page.locator("#form-status")).toContainText("Copiado");
  expect(await page.evaluate(() => window.copiedText)).toBe(
    await page.getByLabel("Mensaje preparado").inputValue(),
  );
});

test("signature preserves hosting subpath, encodes reference and rejects unsafe destinations", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByText("Crear firma para un proyecto").click();
  await expect(page.getByLabel("URL pública de esta landing")).toHaveValue(
    "http://127.0.0.1:4179/site/",
  );
  await page.getByRole("button", { name: "Generar firma" }).click();
  await expect(page.locator("#signature-status")).toContainText(
    "dirección local",
  );
  await page
    .getByLabel("URL pública de esta landing")
    .fill("javascript:alert(1)");
  await page.getByRole("button", { name: "Generar firma" }).click();
  await expect(page.locator("#signature-result")).toBeHidden();
  await page
    .getByLabel("URL pública de esta landing")
    .fill("https://example.com/portfolio/?utm_source=footer");
  await page
    .getByLabel("Nombre del proyecto")
    .fill('Tienda & Diseño "especial"');
  await page.getByRole("button", { name: "Generar firma" }).click();
  const code = await page.getByLabel("HTML para el pie de página").inputValue();
  expect(code).toContain("&amp;proyecto=");
  expect(code).toContain('rel="noopener noreferrer"');
  const url = new URL(
    await page.locator("#signature-preview").getAttribute("href"),
  );
  expect(url.pathname).toBe("/portfolio/");
  expect(url.searchParams.get("proyecto")).toBe('Tienda & Diseño "especial"');
  expect(url.hash).toBe("#contacto");
  await page.goto(`./?${url.searchParams.toString()}#contacto`);
  await expect(page.getByLabel("Proyecto de referencia")).toHaveValue(
    'Tienda & Diseño "especial"',
  );
});

test("URL reference is plain text, bounded, and cannot inject HTML", async ({
  page,
}) => {
  const attack = "<img src=x onerror=alert(1)>" + "a".repeat(150);
  await page.goto(`./?proyecto=${encodeURIComponent(attack)}`);
  await expect(page.getByLabel("Proyecto de referencia")).toHaveValue(
    attack.slice(0, 120),
  );
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
});

test("content, navigation and direct email work without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4179/site/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("#contact-fallback")).toBeVisible();
  await expect(page.locator("#contact-fallback")).toContainText(
    "escribime directamente",
  );
  await expect(page.locator("#inquiry-form")).toBeHidden();
  await page.getByText("¿Cómo formalizamos el trabajo?").click();
  await expect(page.getByText("Una vez conversado el proyecto")).toBeVisible();
  await expect(page.locator(".email-link")).toHaveAttribute(
    "href",
    "mailto:moreappmix@gmail.com",
  );
  await context.close();
});

test("keyboard skip link and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Saltar al contenido" }),
  ).toBeFocused();
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
});

test("accessibility of landing and prepared inquiry", async ({ page }) => {
  const AxeBuilder = require("@axe-core/playwright").default;
  await page.goto("./");
  let results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await fillInquiry(page);
  await page.getByRole("button", { name: "Preparar consulta" }).click();
  results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("a new visit changes the palette and hotel inquiry retains its context", async ({ page }) => {
  await page.goto("./");
  const first = await page.locator("html").getAttribute("data-palette");
  await page.reload();
  const second = await page.locator("html").getAttribute("data-palette");
  expect(second).not.toBe(first);
  await page.getByRole("button", { name: /Cambiar ambiente/ }).click();
  expect(await page.locator("html").getAttribute("data-palette")).not.toBe(second);
  await page.getByRole("button", { name: "Pausar animaciones" }).click();
  await expect(page.getByRole("button", { name: "Reanudar animaciones" })).toHaveAttribute("aria-pressed", "true");
  expect(await page.locator(".route-line").evaluate(el => getComputedStyle(el).animationPlayState)).toBe("paused");
  await page.getByRole("link", { name: "Consultar por Vigía" }).click();
  await expect(page.getByLabel("¿Qué necesitás?")).toHaveValue("Hotelería, GPS y personal");
  await expect(page.getByLabel("Proyecto de referencia")).toHaveValue("Vigía · GPS y rondas");
});

test("blocked preference storage does not break the portfolio", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new Error("Storage blocked"); } });
  });
  await page.goto("./");
  await expect(page.locator("#inquiry-form")).toBeVisible();
  await expect(page.locator("#palette-name")).not.toBeEmpty();
  await page.getByRole("button", { name: /Cambiar ambiente/ }).click();
  await fillInquiry(page);
  await page.getByRole("button", { name: "Preparar consulta" }).click();
  await expect(page.locator("#inquiry-result")).toBeVisible();
});

test("all color environments retain accessible contrast", async ({ page }) => {
  const AxeBuilder = require("@axe-core/playwright").default;
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.goto("./");
  for (let index = 0; index < 5; index++) {
    await page.evaluate((previous) => {
      localStorage.setItem("skull-portfolio-palette", String(previous));
    }, (index + 4) % 5);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-palette", String(index));
    const result = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
    expect(result.violations).toEqual([]);
  }
});



test('portfolio catalog searches, filters, and recovers from empty results', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('.portfolio-card:visible')).toHaveCount(6);
  await page.getByRole('button', { name: 'Todos', exact: true }).click();
  await expect(page.locator('.portfolio-card:visible')).toHaveCount(21);
  await page.locator('#project-search').fill('Vigía');
  await expect(page.locator('.portfolio-card:visible')).toHaveCount(3);
  await page.locator('#project-search').fill('no-such-project-987');
  await expect(page.locator('#no-projects')).toBeVisible();
  await page.locator('#reset-projects').click();
  await expect(page.locator('.portfolio-card:visible')).toHaveCount(21);
  await page.locator('[data-filter="mobile"]').click();
  const categories = await page.locator('.portfolio-card:visible').evaluateAll(cards => cards.map(card => card.dataset.category));
  expect(categories.length).toBeGreaterThan(0);
  expect(categories.every(category => category.split(' ').includes('mobile'))).toBe(true);
});

test('project dialog supports keyboard, accessibility, and inquiry context', async ({ page }) => {
  await page.goto('./');
  const opener = page.locator('[data-case="vigia"]');
  await opener.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#case-title')).toHaveText('Vigía · Gestión Hotelera');
  const AxeBuilder = require('@axe-core/playwright').default;
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(opener).toBeFocused();
  await opener.click();
  await page.locator('[data-inquire="vigia"]').click();
  await expect(page.getByLabel('¿Qué necesitás?')).toHaveValue('Hotelería, GPS y personal');
  await expect(page.locator('[name="reference"]')).toHaveValue('Vigía · Gestión Hotelera');
});

test('root URL redirects and retains project deep link', async ({ page }) => {
  await page.goto('/?caso=fluxnet');
  await expect(page).toHaveURL(/\/site\/\?caso=fluxnet/);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#case-title')).toContainText('FluxNet');
});

test('portfolio review screenshots', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await page.screenshot({ path: testInfo.outputPath('portfolio-desktop.png') });
  await page.locator('#proyectos').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('portfolio-catalog.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await page.screenshot({ path: testInfo.outputPath('portfolio-mobile.png') });
});
