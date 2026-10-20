const root = document.documentElement;
const base = import.meta.env.BASE_URL;
const themeButton = document.querySelector<HTMLButtonElement>("#theme-toggle");
const systemTheme = matchMedia("(prefers-color-scheme: dark)");
function applyTheme(theme: string) {
  root.dataset.theme = theme;
  themeButton?.setAttribute("aria-pressed", String(theme === "dark"));
  themeButton?.setAttribute(
    "aria-label",
    theme === "dark" ? "Activar modo claro" : "Activar modo oscuro",
  );
  const label = themeButton?.querySelector("span");
  if (label) label.textContent = theme === "dark" ? "Claro" : "Oscuro";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      "content",
      getComputedStyle(root).getPropertyValue("--paper").trim(),
    );
}
if (themeButton) themeButton.hidden = false;
applyTheme(root.dataset.theme || (systemTheme.matches ? "dark" : "light"));
themeButton?.addEventListener("click", () => {
  const theme = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(theme);
  try {
    localStorage.setItem("skull-theme", theme);
  } catch {}
});
systemTheme.addEventListener("change", (event) => {
  try {
    if (localStorage.getItem("skull-theme")) return;
  } catch {}
  applyTheme(event.matches ? "dark" : "light");
});
const sceneImages = [...document.querySelectorAll<HTMLElement>(".scene-image")];
const sceneButtons = [
  ...document.querySelectorAll<HTMLButtonElement>("[data-scene-select]"),
];
const sceneSections = [
  ...document.querySelectorAll<HTMLElement>("[data-scene]"),
];
function activateScene(index: number) {
  sceneImages.forEach((image, i) => {
    image.classList.toggle("is-active", i === index);
    image.setAttribute("aria-hidden", String(i !== index));
  });
  sceneButtons.forEach((button, i) =>
    button.setAttribute("aria-pressed", String(i === index)),
  );
  sceneSections.forEach((section, i) =>
    section.classList.toggle("is-active", i === index),
  );
}
if (sceneImages.length) {
  document.querySelector<HTMLElement>(".scene-controls")!.hidden = false;
  sceneButtons.forEach((button, i) =>
    button.addEventListener("click", () => activateScene(i)),
  );
  activateScene(0);
}
const menu = document.querySelector<HTMLButtonElement>(".menu-toggle");
const mobileNav = document.querySelector<HTMLDialogElement>("#mobile-nav");
const chapterToggle =
  document.querySelector<HTMLButtonElement>("#chapters-toggle");
if (menu && mobileNav) {
  menu.hidden = false;
  if (chapterToggle) chapterToggle.hidden = false;
  let opener: HTMLElement = menu;
  const closeMenu = () => {
    mobileNav.getAnimations().forEach((animation) => animation.cancel());
    mobileNav.close();
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Abrir menú");
    mobileNav.hidden = true;
    chapterToggle?.setAttribute("aria-expanded", "false");
    opener.focus({ preventScroll: true });
  };
  const openMenu = (button: HTMLButtonElement, animate: boolean) => {
    if (mobileNav.open) {
      closeMenu();
      return;
    }
    opener = button;
    mobileNav.hidden = false;
    mobileNav.showModal();
    menu.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-label", "Cerrar menú");
    chapterToggle?.setAttribute("aria-expanded", "true");
    if (
      animate &&
      root.dataset.effects === "full" &&
      root.dataset.motion !== "paused"
    )
      mobileNav
        .querySelector(".chapter-menu-content")
        ?.animate(
          [{ transform: "translateY(28px)" }, { transform: "translateY(0)" }],
          { duration: 450, easing: "cubic-bezier(.16,1,.3,1)" },
        );
  };
  menu.addEventListener("click", (event) => openMenu(menu, event.detail > 0));
  chapterToggle?.addEventListener("click", (event) =>
    openMenu(chapterToggle, event.detail > 0),
  );
  mobileNav
    .querySelector("#chapters-close")
    ?.addEventListener("click", closeMenu);
  mobileNav.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeMenu();
  });
  mobileNav.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = [
      ...mobileNav.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href]",
      ),
    ];
    const first = focusable[0],
      last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });
  mobileNav
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));
  matchMedia("(min-width: 768px)").addEventListener("change", (event) => {
    if (event.matches && mobileNav.open) closeMenu();
  });
}

const materialSelect =
  document.querySelector<HTMLSelectElement>("#material-mode");
if (materialSelect) materialSelect.value = root.dataset.material || "glass";
materialSelect?.addEventListener("change", () => {
  root.dataset.material = materialSelect.value;
  try {
    localStorage.setItem("skull-material", materialSelect.value);
  } catch {}
});

const palettes = ["forest", "blue", "clay", "violet", "amber", "ice"];
const paletteNames = ["Menta", "Azul", "Coral", "Violeta", "Ámbar", "Hielo"];
const paletteButton =
  document.querySelector<HTMLButtonElement>("#palette-toggle");

document.querySelector<HTMLElement>(".preferences")?.removeAttribute("hidden");
const showPalette = () => {
  const index = Math.max(0, palettes.indexOf(root.dataset.palette || "clay"));
  const label = paletteButton?.querySelector("span");
  if (label) label.textContent = paletteNames[index];
};
paletteButton?.addEventListener("click", () => {
  const index =
    (palettes.indexOf(root.dataset.palette || "clay") + 1) % palettes.length;
  root.dataset.palette = palettes[index];
  try {
    sessionStorage.setItem("skull-palette", palettes[index]);
    localStorage.setItem("skull-last-palette", palettes[index]);
  } catch {}
  showPalette();
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      "content",
      getComputedStyle(root).getPropertyValue("--paper").trim(),
    );
});
showPalette();

// Always enabled; renderers independently suspend when hidden or offscreen.
root.dataset.motionMode = "full";
root.dataset.motion = "active";
root.dataset.effects = "full";
document.dispatchEvent(new CustomEvent("skull:motion"));

const inquiry = document.querySelector<HTMLFormElement>("#inquiry-form");
if (inquiry) {
  document.querySelector<HTMLElement>(".inquiry-details")!.hidden = false;
  const error = document.querySelector<HTMLElement>("#form-error")!;
  const result = document.querySelector<HTMLElement>("#inquiry-result")!;
  const message =
    document.querySelector<HTMLTextAreaElement>("#inquiry-message")!;
  const draft = document.querySelector<HTMLAnchorElement>("#email-draft")!;
  const status = document.querySelector<HTMLElement>("#copy-status")!;
  const reference = inquiry.elements.namedItem("reference") as HTMLInputElement;
  const query = new URLSearchParams(location.search);
  reference.value = (query.get("proyecto") || "").slice(0, 120);
  inquiry.addEventListener("input", () => {
    result.hidden = true;
    error.hidden = true;
    message.value = "";
    draft.removeAttribute("href");
    status.textContent = "";
  });
  inquiry.addEventListener("submit", (event) => {
    event.preventDefault();
    for (const element of inquiry.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement
    >("input, textarea:not([readonly])"))
      element.value = element.value.trim();
    if (!inquiry.checkValidity()) {
      error.textContent =
        "Completá nombre, un email válido, el tipo de proyecto y una descripción de al menos 15 caracteres.";
      error.hidden = false;
      inquiry.reportValidity();
      return;
    }
    const data = new FormData(inquiry);
    const text = `Hola, Skull.\n\nSoy ${data.get("name")} (${data.get("email")}).\nMe interesa: ${data.get("service")}.\n${data.get("reference") ? `Proyecto de referencia: ${data.get("reference")}\n` : ""}\n${data.get("idea")}\n\nEnviado desde el portafolio de Skull.`;
    message.value = text;
    draft.href = `mailto:moreappmix@gmail.com?subject=${encodeURIComponent(`Consulta: ${data.get("service")}`)}&body=${encodeURIComponent(text)}`;
    error.hidden = true;
    result.hidden = false;
    message.focus();
  });
  document
    .querySelector("#copy-inquiry")
    ?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(message.value);
        status.textContent = "Mensaje copiado.";
      } catch {
        message.focus();
        message.select();
        status.textContent =
          "Seleccioné el mensaje. Podés copiarlo con el menú del navegador o con Ctrl+C.";
      }
    });
  document.querySelector("#download-inquiry")?.addEventListener("click", () => {
    const url = URL.createObjectURL(
      new Blob([message.value], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "consulta-skull.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

const search = document.querySelector<HTMLInputElement>("#project-search");
if (search) {
  const rows = [...document.querySelectorAll<HTMLElement>(".catalog-row")];
  const filters = [
    ...document.querySelectorAll<HTMLButtonElement>("[data-filter]"),
  ];
  let selected = "all";
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const update = () => {
    let count = 0;
    const query = normalize(search.value.trim());
    for (const row of rows) {
      row.hidden = !(
        normalize(row.textContent || "").includes(query) &&
        (selected === "all" ||
          row.dataset.category?.split(" ").includes(selected))
      );
      if (!row.hidden) count++;
    }
    filters.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.filter === selected),
      ),
    );
    document.querySelector("#project-count")!.textContent =
      `${count} de ${rows.length} proyectos`;
    (document.querySelector("#empty-projects") as HTMLElement).hidden =
      count !== 0;
  };
  filters.forEach((button) =>
    button.addEventListener("click", () => {
      selected = button.dataset.filter!;
      update();
    }),
  );
  search.addEventListener("input", update);
  document.querySelector("#reset-projects")?.addEventListener("click", () => {
    selected = "all";
    search.value = "";
    update();
    search.focus();
  });
  document.querySelector<HTMLElement>(".catalog-tools")!.hidden = false;
  update();
}

const oldCase = new URLSearchParams(location.search).get("caso");
if (oldCase && document.querySelector(".sp-hero")) {
  const links = [...document.querySelectorAll<HTMLAnchorElement>("a[href]")];
  const target = links.find(
    (link) => link.pathname === `${base}proyectos/${oldCase}/`,
  );
  if (target) location.replace(target.href);
  else if (
    document
      .querySelector<HTMLElement>(".signal-world")
      ?.dataset.caseIds?.split(" ")
      .includes(oldCase)
  )
    location.replace(`${base}proyectos/${oldCase}/`);
  else if (/^[a-z0-9-]+$/.test(oldCase))
    location.replace(`${base}proyectos/#${encodeURIComponent(oldCase)}`);
}
