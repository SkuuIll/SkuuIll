import { chromium } from "playwright";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import {
  readFileSync,
  writeFileSync,
  createReadStream,
  existsSync,
  mkdirSync,
} from "node:fs";
import { resolve, extname, basename, sep } from "node:path";

const dist = resolve("dist");
const out = resolve("public/cv");
mkdirSync(out, { recursive: true });
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};
const server = createServer((req, res) => {
  const path = decodeURIComponent(
    new URL(req.url, "http://localhost").pathname,
  );
  if (!path.startsWith("/SkuuIll/")) {
    res.writeHead(404);
    res.end();
    return;
  }
  let file = resolve(dist, path.slice("/SkuuIll/".length));
  if (path.endsWith("/")) file = resolve(file, "index.html");
  if (!file.startsWith(dist + sep) || !existsSync(file)) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.setHeader(
    "Content-Type",
    types[extname(file)] || "application/octet-stream",
  );
  createReadStream(file).pipe(res);
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const browser = await chromium.launch({ headless: true });
const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1000 },
    reducedMotion: "reduce",
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/SkuuIll/cv/`, {
    waitUntil: "networkidle",
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const a of document.querySelectorAll('a[href^="/SkuuIll/"]'))
      a.href = new URL(
        a.getAttribute("href"),
        "https://skuuill.github.io",
      ).href;
  });
  const data = await page.evaluate(() => {
    const article = document.querySelector(".cv-document");
    const paragraphs = (element) =>
      [...element.querySelectorAll("p")].map((p) => p.textContent.trim());
    return {
      name: article.querySelector("h1").textContent,
      role: article.querySelector(".cv-role").textContent,
      contact: [...article.querySelector(".cv-contact").children].map((e) => ({
        text: e.textContent,
        href: e.getAttribute("href"),
      })),
      summary: article.querySelector(".cv-body section p").textContent,
      education: [...article.querySelectorAll(".cv-education")].map((e) => ({
        title: e.querySelector("h3").textContent,
        paragraphs: paragraphs(e),
      })),
      experience: [...article.querySelectorAll(".cv-experience")].map((e) => ({
        title: e.querySelector("h3").textContent,
        date: e.querySelector(".cv-date").textContent,
        paragraphs: [...e.querySelectorAll("p:not(.cv-date)")].map(
          (p) => p.textContent,
        ),
        bullets: [...e.querySelectorAll("li")].map((li) => li.textContent),
      })),
      projects: [...article.querySelectorAll(".cv-project")].map((e) => ({
        title: e.querySelector("h3").textContent,
        href: e.querySelector("a").href,
        paragraphs: paragraphs(e),
      })),
      skills: [...article.querySelectorAll(".cv-skill")].map((e) => ({
        title: e.querySelector("h3").textContent,
        paragraphs: paragraphs(e),
      })),
    };
  });
  await page.pdf({
    path: resolve(out, "Facundo-Escobedo-CV.pdf"),
    format: "Letter",
    preferCSSPageSize: true,
    printBackground: true,
    tagged: true,
    outline: true,
  });
  let css = await page.evaluate(() =>
    [...document.styleSheets]
      .flatMap((sheet) => [...sheet.cssRules].map((rule) => rule.cssText))
      .join("\n"),
  );
  css = css.replace(/url\(["']?([^\)"']+)["']?\)/g, (whole, url) => {
    if (!url.endsWith(".woff2")) return whole;
    const file = resolve(dist, "_astro", basename(url));
    return `url(data:font/woff2;base64,${readFileSync(file).toString("base64")})`;
  });
  const article = await page
    .locator(".cv-document")
    .evaluate((element) => element.outerHTML);
  const editorScript = `const article=document.querySelector('.cv-document');const edit=document.querySelector('#edit');edit.onclick=()=>{const enabled=article.contentEditable!=='true';article.contentEditable=String(enabled);edit.textContent=enabled?'Terminar edición':'Editar texto';document.querySelector('#editor-status').textContent=enabled?'Podés hacer clic sobre el texto para editarlo. Guardá una copia al terminar.':'';if(enabled)article.focus();};document.querySelector('#save').onclick=()=>{article.contentEditable='false';edit.textContent='Editar texto';const blob=new Blob(['<!doctype html>'+document.documentElement.outerHTML],{type:'text/html;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Facundo-Escobedo-CV-Editable.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};document.querySelector('#print').onclick=()=>window.print();`;
  const editor = `<!doctype html><html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(data.name)} — CV editable</title><style>${css}\n.editor-toolbar{width:min(1120px,calc(100% - 40px));margin:25px auto;display:flex;flex-wrap:wrap;gap:10px;align-items:center}.editor-toolbar button{padding:12px 18px;border:1px solid #c8c9bd;background:#fff;font-size:13px}.editor-toolbar p{font-size:12px;width:100%}.cv-document[contenteditable=true]{outline:2px dashed #b63f23;outline-offset:8px}@media print{.editor-toolbar{display:none!important}.cv-document{outline:none!important}}</style></head><body><div class="editor-toolbar" contenteditable="false"><button id="edit" type="button">Editar texto</button><button id="save" type="button">Guardar copia HTML</button><button id="print" type="button">Imprimir o guardar PDF</button><p id="editor-status" role="status">Esta copia funciona sin conexión. Los enlaces del portafolio requieren internet.</p></div>${article}<script>${editorScript}</script></body></html>`;
  writeFileSync(resolve(out, "Facundo-Escobedo-CV-Editable.html"), editor);
  const paragraphs = (items) =>
    items.map((p) => `<p>${escape(p)}</p>`).join("");
  const ats = `<!doctype html><html lang="es-AR"><head><meta charset="utf-8"><title>${escape(data.name)} — Currículum</title><style>@page{size:letter;margin:14mm 17mm}body{font-family:Arial,sans-serif;color:#171b18;font-size:10.5pt;line-height:1.35;margin:0}h1{font-size:25pt;line-height:1.12;margin:0 0 8pt}h2{font-size:12pt;margin:12pt 0 7pt;break-after:avoid}h3{font-size:10.5pt;margin:7pt 0 3pt;break-after:avoid}p{margin:3pt 0}a{color:inherit;text-decoration:none}.contact{font-size:9pt}.date,.small{font-size:9pt;color:#454b43}ul{margin:5pt 0 9pt;padding-left:17pt}li{margin:2pt 0}.entry{break-inside:avoid}.projects{break-before:page}.projects .entry{margin-bottom:8pt}.projects h2{font-size:21pt;margin-top:5pt}.skills{margin-top:14pt}.skills p{font-size:9.5pt}</style></head><body><h1>${escape(data.name)}</h1><p>${escape(data.role.replace(/\s+/g, " ").trim())}</p><p class="contact">${data.contact.map((c) => (c.href ? `<a href="${escape(c.href)}">${escape(c.text)}</a>` : escape(c.text))).join(" | ")}</p><h2>Perfil profesional</h2><p>${escape(data.summary)}</p><h2>Experiencia</h2>${data.experience.map((e) => `<div class="entry"><h3>${escape(e.title)}</h3><p class="date">${escape(e.date)}</p>${paragraphs(e.paragraphs)}${e.bullets.length ? `<ul>${e.bullets.map((b) => `<li>${escape(b)}</li>`).join("")}</ul>` : ""}</div>`).join("")}<h2>Formación</h2>${data.education.map((e) => `<div class="entry"><h3>${escape(e.title)}</h3>${paragraphs(e.paragraphs)}</div>`).join("")}<section class="projects"><p class="small">${escape(data.name)} / Skull</p><h2>Proyectos seleccionados</h2>${data.projects.map((p) => `<div class="entry"><h3><a href="${escape(p.href)}">${escape(p.title.replace(" ↗", ""))}</a></h3>${paragraphs(p.paragraphs)}</div>`).join("")}<div class="skills"><h2>Tecnologías y herramientas</h2>${data.skills.map((s) => `<p><strong>${escape(s.title)}:</strong> ${escape(s.paragraphs.join(" "))}</p>`).join("")}</div><p class="small">Portafolio: <a href="https://skuuill.github.io/SkuuIll/">https://skuuill.github.io/SkuuIll/</a></p></section></body></html>`;
  writeFileSync(resolve(out, "Facundo-Escobedo-CV-ATS.html"), ats);
  await page.setContent(ats, { waitUntil: "load" });
  await page.pdf({
    path: resolve(out, "Facundo-Escobedo-CV-ATS.pdf"),
    format: "Letter",
    preferCSSPageSize: true,
    printBackground: true,
    tagged: true,
    outline: true,
  });
  const sources = [
    "src/data/profile.ts",
    "src/data/projects.json",
    "src/data/projects.ts",
    "src/pages/cv/index.astro",
    "src/styles/global.css",
    "scripts/export-cv.mjs",
  ];
  const hash = (path) =>
    createHash("sha256").update(readFileSync(path)).digest("hex");
  const files = [
    "Facundo-Escobedo-CV.pdf",
    "Facundo-Escobedo-CV-ATS.pdf",
    "Facundo-Escobedo-CV-Editable.html",
    "Facundo-Escobedo-CV-ATS.html",
  ];
  writeFileSync(
    resolve(out, "manifest.json"),
    JSON.stringify(
      {
        sources: Object.fromEntries(
          sources.map((path) => [
            path,
            createHash("sha256")
              .update(readFileSync(path, "utf8").replace(/\r\n/g, "\n"))
              .digest("hex"),
          ]),
        ),
        files: Object.fromEntries(
          files.map((name) => [name, hash(resolve(out, name))]),
        ),
      },
      null,
      2,
    ) + "\n",
  );
  console.log("PDF, ATS PDF and offline editable HTML exported to public/cv.");
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
