import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./cinema";
gsap.registerPlugin(ScrollTrigger);

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
    ?.setAttribute("content", theme === "dark" ? "#161a19" : "#f4f2ec");
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
const mobileNav = document.querySelector<HTMLElement>("#mobile-nav");
if (menu && mobileNav) {
  menu.hidden = false;
  const closeMenu = () => {
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Abrir menú");
    mobileNav.hidden = true;
  };
  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    mobileNav.hidden = !open;
  });
  mobileNav
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !mobileNav.hidden) {
      closeMenu();
      menu.focus();
    }
  });
  matchMedia("(min-width: 768px)").addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });
}

const palettes = ["clay", "forest", "blue"];
const paletteNames = ["Arcilla", "Bosque", "Azul"];
const paletteButton =
  document.querySelector<HTMLButtonElement>("#palette-toggle");
const motionButton =
  document.querySelector<HTMLButtonElement>("#motion-toggle");
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
  } catch {}
  showPalette();
});
showPalette();

let motion: gsap.MatchMedia | undefined;
function setupMotion() {
  motion?.revert();
  if (root.dataset.motion === "paused") return;
  motion = gsap.matchMedia();
  motion.add("(prefers-reduced-motion: no-preference)", () => {
    const hoverCleanups: Array<() => void> = [];
    if (document.querySelector(".cinema-hero")) {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".cinema-hero",
          start: "top top",
          end: "bottom top",
          pin: true,
          pinSpacing: false,
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
      });
      timeline
        .to(".cinema-media", { scale: 1.18, yPercent: -8, ease: "none" }, 0)
        .to(".cinema-copy", { yPercent: -18, opacity: 0, ease: "none" }, 0)
        .to(".cinema-bottom", { opacity: 0, ease: "none", duration: 0.25 }, 0);
      gsap.fromTo(
        ".cinema-cover .atelier-stage",
        { scale: 0.88, rotate: 3 },
        {
          scale: 1,
          rotate: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ".cinema-cover .atelier-stage",
            start: "top bottom",
            end: "center center",
            scrub: 0.8,
          },
        },
      );
      gsap.to(".hotel-environment", {
        yPercent: -9,
        scale: 1.12,
        ease: "none",
        scrollTrigger: {
          trigger: ".hotel-composition",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
      gsap.fromTo(
        ".hotel-device",
        { yPercent: 22, rotate: 6 },
        {
          yPercent: -8,
          rotate: -3,
          ease: "none",
          scrollTrigger: {
            trigger: ".hotel-composition",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        },
      );
    }
    document.querySelector(".vigia-story")?.classList.add("has-scenes");
    if (document.querySelector("[data-hero-line]"))
      gsap.from("[data-hero-line]", {
        y: 28,
        duration: 1.15,
        stagger: 0.12,
        ease: "power3.out",
        clearProps: "all",
      });
    if (document.querySelector(".hero-composition"))
      gsap.from(".hero-composition", {
        y: 45,
        duration: 1.3,
        delay: 0.14,
        ease: "power3.out",
        clearProps: "transform",
      });
    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
      gsap.from(element, {
        y: 32,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 94%", once: true },
        clearProps: "all",
      });
    });
    gsap.utils.toArray<HTMLElement>("[data-depth]").forEach((element) => {
      gsap.to(element, {
        y: -22,
        rotation: 2,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    });
    gsap.utils
      .toArray<HTMLElement>(".exhibition-heading h2")
      .forEach((element) => {
        gsap.from(element, {
          y: 45,
          rotateX: 12,
          transformPerspective: 900,
          duration: 1.15,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 92%", once: true },
          clearProps: "all",
        });
      });
    document
      .querySelectorAll<HTMLElement>(
        ".atelier-section.is-compact .atelier-stage",
      )
      .forEach((element) => {
        const enter = () => {
          if (matchMedia("(hover: hover)").matches)
            gsap.to(element, {
              rotateX: -2,
              rotateY: 3,
              transformPerspective: 900,
              duration: 0.6,
              ease: "power2.out",
            });
        };
        const leave = () =>
          gsap.to(element, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.7,
            ease: "power3.out",
          });
        element.addEventListener("pointerenter", enter);
        element.addEventListener("pointerleave", leave);
        hoverCleanups.push(() => {
          element.removeEventListener("pointerenter", enter);
          element.removeEventListener("pointerleave", leave);
          gsap.killTweensOf(element);
          gsap.set(element, { clearProps: "transform" });
        });
      });
    if (
      matchMedia("(min-width: 768px)").matches &&
      document.querySelector(".hero-composition")
    ) {
      gsap.to(".hero-composition", {
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }
    if (matchMedia("(min-width: 768px)").matches) {
      sceneSections.forEach((section, index) =>
        ScrollTrigger.create({
          trigger: section,
          start: "top 60%",
          end: "bottom 40%",
          onEnter: () => activateScene(index),
          onEnterBack: () => activateScene(index),
        }),
      );
    }
    if (!CSS.supports("animation-timeline", "scroll()"))
      gsap.to(".reading-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: true },
      });
    return () => {
      hoverCleanups.forEach((cleanup) => cleanup());
      document.querySelector(".vigia-story")?.classList.remove("has-scenes");
    };
  });
}
try {
  if (sessionStorage.getItem("skull-motion") === "paused")
    root.dataset.motion = "paused";
} catch {}
const showMotion = () => {
  const paused = root.dataset.motion === "paused";
  if (motionButton) {
    motionButton.textContent = paused
      ? "Activar movimiento"
      : "Pausar movimiento";
    motionButton.setAttribute("aria-pressed", String(paused));
  }
  document.dispatchEvent(new CustomEvent("skull:motion"));
};
motionButton?.addEventListener("click", () => {
  const paused = root.dataset.motion !== "paused";
  root.dataset.motion = paused ? "paused" : "active";
  if (paused)
    document
      .querySelector("#atelier-shot")
      ?.getAnimations()
      .forEach((animation) => animation.cancel());
  try {
    sessionStorage.setItem("skull-motion", paused ? "paused" : "active");
  } catch {}
  setupMotion();
  showMotion();
});
setupMotion();
showMotion();
matchMedia("(min-width: 768px)").addEventListener("change", setupMotion);
window.addEventListener("pagehide", () => motion?.revert(), { once: true });
window.addEventListener("pageshow", (event) => {
  if (event.persisted) setupMotion();
});

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
if (oldCase && document.querySelector(".hero")) {
  const links = [...document.querySelectorAll<HTMLAnchorElement>("a[href]")];
  const target = links.find(
    (link) => link.pathname === `${base}proyectos/${oldCase}/`,
  );
  if (target) location.replace(target.href);
  else if (/^[a-z0-9-]+$/.test(oldCase))
    location.replace(`${base}proyectos/#${encodeURIComponent(oldCase)}`);
}
