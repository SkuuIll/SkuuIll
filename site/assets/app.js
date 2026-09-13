"use strict";

const form = document.querySelector("#inquiry-form");
const result = document.querySelector("#inquiry-result");
const preview = document.querySelector("#inquiry-preview");
const formStatus = document.querySelector("#form-status");
const emailDraft = document.querySelector("#email-draft");
const recipient = "skuuill@gmail.com";
let inquiryText = "";

function buildInquiry(data) {
  const value = (key) => String(data.get(key) || "").trim();
  return [
    "Hola SkuuIll, me gustaría conversar sobre un proyecto.",
    "",
    `Nombre: ${value("name")}`,
    `Email: ${value("email")}`,
    `Servicio: ${value("service")}`,
    `Presupuesto estimado: ${value("budget") || "A definir"}`,
    `Plazo ideal: ${value("timeline") || "A definir"}`,
    `Referencia: ${value("reference") || "Sin referencia"}`,
    "",
    "Mi idea:",
    value("message"),
    "",
    "Me gustaría definir el alcance, los entregables y recibir una propuesta.",
  ].join("\n");
}

async function copyText(text, field, status) {
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = "Copiado al portapapeles.";
  } catch {
    field.focus();
    field.select();
    status.textContent =
      "No pudimos acceder al portapapeles. El texto está seleccionado para que lo copies manualmente.";
  }
}

function invalidateInquiry() {
  result.hidden = true;
  inquiryText = "";
  formStatus.textContent = "";
}

form.addEventListener("input", invalidateInquiry);
form.addEventListener("change", invalidateInquiry);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = form.elements.namedItem("name");
  const message = form.elements.namedItem("message");
  name.setCustomValidity(name.value.trim() ? "" : "Escribí tu nombre.");
  message.setCustomValidity(
    message.value.trim().length >= 20
      ? ""
      : "Contame un poco más: al menos 20 caracteres, sin contar espacios al principio y al final.",
  );
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  inquiryText = buildInquiry(data);
  preview.value = inquiryText;
  const subject = `Consulta de proyecto — ${data.get("service")}`;
  emailDraft.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(inquiryText)}`;
  result.hidden = false;
  result.focus();
  formStatus.textContent =
    "Consulta preparada. Elegí abrir tu correo, copiarla o descargarla.";
});

for (const name of ["name", "message"]) {
  form.elements
    .namedItem(name)
    .addEventListener("input", (event) => event.target.setCustomValidity(""));
}

document
  .querySelector("#copy-inquiry")
  .addEventListener("click", () => copyText(inquiryText, preview, formStatus));
document.querySelector("#download-inquiry").addEventListener("click", () => {
  if (!inquiryText) return;
  const url = URL.createObjectURL(
    new Blob([inquiryText], { type: "text/plain;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "consulta-proyecto-skuuill.txt";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  formStatus.textContent = "Descarga de la consulta iniciada.";
});

const reference = form.elements.namedItem("reference");
const incomingProject = new URLSearchParams(window.location.search).get(
  "proyecto",
);
if (incomingProject) reference.value = incomingProject.slice(0, 120);

document.querySelectorAll("[data-service]").forEach((link) => {
  link.addEventListener("click", () => {
    form.elements.namedItem("service").value = link.dataset.service;
    if (link.dataset.project) reference.value = link.dataset.project;
    invalidateInquiry();
  });
});

const signatureProject = document.querySelector("#signature-project");
const signatureUrl = document.querySelector("#signature-url");
const signatureResult = document.querySelector("#signature-result");
const signatureCode = document.querySelector("#signature-code");
const signatureStatus = document.querySelector("#signature-status");
// Use the actual hosting path, including a GitHub Pages repository prefix.
const currentUrl = new URL(window.location.href);
if (["https:", "http:"].includes(currentUrl.protocol)) {
  currentUrl.search = "";
  currentUrl.hash = "";
  signatureUrl.value = currentUrl.href;
}

function escapeAttribute(value) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
}

for (const field of [signatureProject, signatureUrl]) {
  field.addEventListener("input", () => {
    signatureResult.hidden = true;
    signatureStatus.textContent = "";
  });
}

document.querySelector("#generate-signature").addEventListener("click", () => {
  let url;
  try {
    url = new URL(signatureUrl.value.trim());
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw new Error("Invalid URL");
  } catch {
    signatureResult.hidden = true;
    signatureStatus.textContent =
      "Ingresá una URL pública válida que empiece con https:// o http://.";
    signatureUrl.focus();
    return;
  }
  if (["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    signatureResult.hidden = true;
    signatureStatus.textContent =
      "Reemplazá la dirección local por la URL pública de tu futura landing antes de crear la firma.";
    signatureUrl.focus();
    return;
  }
  url.searchParams.delete("proyecto");
  const project = signatureProject.value.trim();
  if (project) url.searchParams.set("proyecto", project);
  url.hash = "contacto";
  const link = document.querySelector("#signature-preview");
  link.href = url.href;
  signatureCode.value = `<a href="${escapeAttribute(url.href)}" target="_blank" rel="noopener noreferrer">Desarrollado por SkuuIll ↗</a>`;
  signatureResult.hidden = false;
  signatureStatus.textContent =
    "Firma lista. El enlace abre tu landing con el proyecto de referencia.";
});

document
  .querySelector("#copy-signature")
  .addEventListener("click", () =>
    copyText(signatureCode.value, signatureCode, signatureStatus),
  );
document.querySelector("#year").textContent = String(new Date().getFullYear());

// Reveal enhanced controls only after successful initialization.
form.hidden = false;
document.querySelector("#contact-fallback").hidden = true;
document.querySelector("#signature-builder").hidden = false;
