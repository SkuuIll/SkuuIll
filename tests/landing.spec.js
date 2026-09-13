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
    await expect(page).toHaveTitle(/SkuuIll/);
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
