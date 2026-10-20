import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const root = document.documentElement;
const world = document.querySelector<HTMLElement>(".signal-world");
const canvas = document.querySelector<HTMLCanvasElement>("#signal-canvas");
const stage = canvas?.parentElement;
const ctx = canvas?.getContext("2d", { alpha: true });
const full = () =>
  root.dataset.effects === "full" && root.dataset.motion !== "paused";
let scrollContext: gsap.Context | undefined;
function setupScroll() {
  scrollContext?.revert();
  if (!full()) return;
  scrollContext = gsap.context(() => {
    gsap.from(".sp-hero-copy > *", {
      y: 24,
      stagger: 0.09,
      duration: 0.85,
      ease: "power3.out",
      clearProps: "all",
    });
    gsap.fromTo(
      ".hero-signature",
      { y: 0 },
      {
        y: -35,
        ease: "none",
        scrollTrigger: {
          trigger: ".sp-hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      },
    );
    gsap.utils
      .toArray<HTMLElement>(
        ".sequence-steps article, .lab-heading, [data-reveal]",
      )
      .forEach((element) => {
        gsap.from(element, {
          y: 30,
          duration: 0.75,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: { trigger: element, start: "top 95%", once: true },
        });
      });
    gsap.from(".process-line span", {
      scaleX: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".sp-process",
        start: "top 80%",
        end: "center 70%",
        scrub: 0.5,
      },
    });
  });
}
setupScroll();
document.addEventListener("skull:motion", setupScroll);

// A single bounded Canvas 2D loop projects a three-dimensional field. No video,
// texture downloads or continuously running WebGL context are needed.
if (canvas && ctx && stage && world) {
  let width = 0,
    height = 0,
    frame = 0,
    time = 0,
    last = 0;
  let visible = true,
    lost = false,
    pointerX = 0,
    pointerY = 0,
    smoothX = 0,
    smoothY = 0;
  let scroll = 0,
    accent = "#4ce1c7",
    blue = "#72a6ff";
  const scene = root.dataset.scene || "orb";
  const seed = Number(root.dataset.seed || 0);
  const phase = ((seed % 1000) / 1000) * Math.PI * 2;
  const lens = stage.querySelector<HTMLElement>(".glass-lens");
  const coarse = matchMedia("(pointer: coarse)");
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  const points = coarse.matches || connection?.saveData ? 216 : 440;
  const columns = coarse.matches || connection?.saveData ? 18 : 22;
  const rows = points / columns;
  const refreshColors = () => {
    const style = getComputedStyle(root);
    accent = style.getPropertyValue("--accent").trim();
    blue = style.getPropertyValue("--signal-blue").trim();
  };
  const resize = () => {
    width = stage.clientWidth;
    height = stage.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, coarse.matches ? 1.25 : 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  };
  const updateScroll = () => {
    const bounds = world.getBoundingClientRect();
    scroll = Math.min(
      1,
      Math.max(0, -bounds.top / Math.max(1, bounds.height - innerHeight)),
    );
    if (lens) lens.style.opacity = String(Math.max(0, 1 - scroll * 2.5));
  };
  function draw() {
    if (lost || !width || !height) return;
    ctx!.clearRect(0, 0, width, height);
    const scale = Math.min(width * 0.34, height * 0.35) * (1 - scroll * 0.22);
    const centerX = width * (0.53 - scroll * (coarse.matches ? 0 : 0.35));
    const rotation = phase + time * 0.12 + smoothX * 0.24 + scroll * 1.3;
    const tilt = -0.25 + smoothY * 0.2 + scroll * 0.25;
    const dots: Array<{ x: number; y: number; z: number }> = [];
    const shape = Math.min(1, scroll * 2.4);
    const connectionShape = Math.max(0, (scroll - 0.5) * 2);
    for (let row = 0; row < rows; row++)
      for (let col = 0; col < columns; col++) {
        const u = col / (columns - 1),
          v = row / (rows - 1),
          angle = u * Math.PI * 2;
        const ring = 1 + 0.22 * Math.sin(v * Math.PI * 4 + time * 0.45);
        const sphereX = Math.cos(angle) * Math.sin(v * Math.PI) * ring;
        const sphereY = Math.cos(v * Math.PI) * 1.2;
        const sphereZ = Math.sin(angle) * Math.sin(v * Math.PI) * ring;
        const waveX = (u - 0.5) * 2.7;
        const waveY =
          (v - 0.5) * 2 + Math.sin(u * 7 + time * 0.6 + v * 3) * 0.3;
        const waveZ = Math.sin(u * 7 + v * 5 + time * 0.35) * 0.4;
        let baseX = sphereX,
          baseY = sphereY,
          baseZ = sphereZ;
        if (scene === "ribbon") {
          baseX = (u - 0.5) * 2.7;
          baseY = (v - 0.5) * 2.1 + Math.sin(u * 8 + phase + time * 0.3) * 0.25;
          baseZ = Math.sin(u * 8 + v * 4 + phase) * 0.55;
        } else if (scene === "helix") {
          const twist = angle + v * Math.PI * 3 + phase;
          baseX = Math.cos(twist) * (0.5 + u * 0.5);
          baseY = (v - 0.5) * 2.7;
          baseZ = Math.sin(twist) * (0.5 + u * 0.5);
        } else if (scene === "torus") {
          const loop = v * Math.PI * 2;
          baseX = (1 + 0.32 * Math.cos(loop)) * Math.cos(angle);
          baseY = 0.32 * Math.sin(loop);
          baseZ = (1 + 0.32 * Math.cos(loop)) * Math.sin(angle);
        } else if (scene === "lattice") {
          baseX = (u - 0.5) * 2.3;
          baseY = (v - 0.5) * 2.3;
          baseZ =
            Math.cos(u * Math.PI * 4 + phase) * Math.sin(v * Math.PI * 3) * 0.5;
        }
        let x = baseX * (1 - shape) + waveX * shape;
        let y = baseY * (1 - shape) + waveY * shape;
        let z = baseZ * (1 - shape) + waveZ * shape;
        x =
          x * (1 - connectionShape) +
          Math.cos(angle + v * 5) * (0.4 + v) * connectionShape;
        z =
          z * (1 - connectionShape) +
          Math.sin(angle + v * 5) * (0.4 + v) * connectionShape;
        const rx = x * Math.cos(rotation) - z * Math.sin(rotation);
        const rz = x * Math.sin(rotation) + z * Math.cos(rotation);
        const ry = y * Math.cos(tilt) - rz * Math.sin(tilt);
        const depth = y * Math.sin(tilt) + rz * Math.cos(tilt);
        const perspective = 3.8 / (3.8 + depth);
        dots.push({
          x: centerX + rx * scale * perspective + smoothX * 12,
          y: height * 0.47 + ry * scale * perspective + smoothY * 12,
          z: depth,
        });
      }
    ctx!.lineWidth = 0.65;
    for (let i = 0; i < dots.length; i++) {
      const p = dots[i];
      ctx!.strokeStyle = i % columns < columns / 2 ? accent : blue;
      ctx!.globalAlpha = 0.12 + (1 - p.z / 2) * 0.13;
      for (const adjacent of [
        i % columns < columns - 1 ? i + 1 : -1,
        i + columns < dots.length ? i + columns : -1,
      ]) {
        if (adjacent < 0) continue;
        const q = dots[adjacent];
        ctx!.beginPath();
        ctx!.moveTo(p.x, p.y);
        ctx!.lineTo(q.x, q.y);
        ctx!.stroke();
      }
      ctx!.globalAlpha = 0.45 + (1 - p.z / 2) * 0.2;
      ctx!.fillStyle = accent;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, i % 17 === 0 ? 2 : 1, 0, Math.PI * 2);
      ctx!.fill();
    }
    ctx!.globalAlpha = 0.25;
    ctx!.strokeStyle = accent;
    ctx!.setLineDash([2, 11]);
    ctx!.beginPath();
    ctx!.ellipse(
      centerX,
      height * 0.47,
      scale * 1.5,
      scale * 1.5,
      0,
      0,
      Math.PI * 2,
    );
    ctx!.stroke();
    ctx!.setLineDash([]);
    ctx!.globalAlpha = 1;
    if (lens)
      lens.style.transform = `perspective(800px) translate3d(${smoothX * 9}px,${smoothY * 9}px,0) rotateX(${-smoothY * 5}deg) rotateY(${smoothX * 7}deg)`;
    stage!.classList.add("is-ready");
  }
  const allowed = () =>
    full() &&
    visible &&
    !document.hidden &&
    !document.querySelector("dialog[open]") &&
    !lost;
  function tick(stamp: number) {
    frame = 0;
    if (!allowed()) {
      last = 0;
      return;
    }
    const delta = last ? Math.min((stamp - last) / 1000, 0.05) : 0;
    last = stamp;
    time += delta;
    smoothX += (pointerX - smoothX) * 0.045;
    smoothY += (pointerY - smoothY) * 0.045;
    draw();
    frame = requestAnimationFrame(tick);
    canvas!.dataset.running = "true";
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    canvas!.dataset.running = "false";
    if (allowed()) frame = requestAnimationFrame(tick);
    else if (!lost) draw();
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  observer.observe(world);
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(stage);
  const themeObserver = new MutationObserver(() => {
    refreshColors();
    sync();
  });
  themeObserver.observe(root, {
    attributes: true,
    attributeFilter: [
      "data-theme",
      "data-palette",
      "data-effects",
      "data-motion",
    ],
  });
  const dialogObserver = new MutationObserver(sync);
  document.querySelectorAll("dialog").forEach((dialog) =>
    dialogObserver.observe(dialog, {
      attributes: true,
      attributeFilter: ["open"],
    }),
  );
  world.addEventListener(
    "pointermove",
    (event) => {
      if (!full() || coarse.matches) return;
      const rect = stage!.getBoundingClientRect();
      pointerX = Math.max(
        -1,
        Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1),
      );
      pointerY = (event.clientY / innerHeight) * 2 - 1;
    },
    { passive: true },
  );
  world.addEventListener("pointerleave", () => {
    pointerX = 0;
    pointerY = 0;
  });
  window.addEventListener("scroll", updateScroll, { passive: true });
  document.addEventListener("visibilitychange", sync);
  canvas.addEventListener("contextlost", (event) => {
    event.preventDefault();
    lost = true;
    stage!.classList.remove("is-ready");
    sync();
  });
  canvas.addEventListener("contextrestored", () => {
    lost = false;
    resize();
    sync();
  });
  refreshColors();
  resize();
  updateScroll();
  sync();
  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    sizeObserver.disconnect();
    themeObserver.disconnect();
    dialogObserver.disconnect();
    scrollContext?.revert();
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      observer.observe(world);
      sizeObserver.observe(stage);
      themeObserver.observe(root, {
        attributes: true,
        attributeFilter: [
          "data-theme",
          "data-palette",
          "data-effects",
          "data-motion",
        ],
      });
      document.querySelectorAll("dialog").forEach((dialog) =>
        dialogObserver.observe(dialog, {
          attributes: true,
          attributeFilter: ["open"],
        }),
      );
      refreshColors();
      resize();
      sync();
      setupScroll();
    }
  });
}

const tabs = [
  ...document.querySelectorAll<HTMLButtonElement>('.lab-tabs [role="tab"]'),
];
function applyTab(index: number) {
  tabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(tab.getAttribute("aria-controls")!);
    if (panel) {
      panel.hidden = !selected;
      panel.style.viewTransitionName = selected ? "lab-experiment" : "none";
    }
  });
}
let tabRevision = 0;
let tabTransition: { skipTransition(): void; ready: Promise<void> } | undefined;
function activateTab(index: number, animate = false) {
  const revision = ++tabRevision;
  tabTransition?.skipTransition();
  const console = document.querySelector<HTMLElement>(".lab-console") as
    | (HTMLElement & {
        startViewTransition?: (update: () => void) => {
          skipTransition(): void;
          ready: Promise<void>;
        };
      })
    | null;
  const update = () => {
    if (revision === tabRevision) applyTab(index);
  };
  if (animate && console?.startViewTransition) {
    tabTransition = console.startViewTransition(update);
    void tabTransition.ready.catch(() => {});
  } else {
    update();
    if (animate)
      document
        .getElementById(tabs[index].getAttribute("aria-controls")!)
        ?.animate(
          [
            { opacity: 0.65, transform: "translateY(8px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" },
        );
  }
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(index, true));
  tab.addEventListener("keydown", (event) => {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (index + tabs.length - 1) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : -1;
    if (next < 0) return;
    event.preventDefault();
    activateTab(next, true);
    tabs[next].focus();
  });
});
document.querySelector<HTMLElement>(".lab-tabs")?.removeAttribute("hidden");
activateTab(0);
document
  .querySelectorAll<HTMLElement>(".lab-controls")
  .forEach((element) => (element.hidden = false));
const density = document.querySelector<HTMLInputElement>("#density");
const composition = document.querySelector<HTMLElement>(".composition-art");
let distribution = 0;
function compose() {
  if (!density || !composition) return;
  const count = Number(density.value);
  composition.style.gridTemplateColumns = `repeat(${count},1fr)`;
  composition.querySelectorAll<HTMLElement>("span").forEach((element, i) => {
    element.hidden = i >= count * count;
    element.style.setProperty("--i", String(i + distribution));
    element.style.borderRadius = `${((i + distribution) % 3) * 12}px`;
    element.style.transform = `rotate(${(i * 3 + distribution * 17) % 180}deg)`;
  });
  document.querySelector("#density-value")!.textContent = density.value;
}
// Enough cells for the largest density; the initial HTML already works without JS.
if (composition)
  for (let i = 64; i < 144; i++) {
    const cell = document.createElement("span");
    cell.style.setProperty("--i", String(i));
    composition.append(cell);
  }
density?.addEventListener("input", compose);
document.querySelector("#layout-shuffle")?.addEventListener("click", () => {
  distribution++;
  compose();
});
compose();
const amplitude = document.querySelector<HTMLInputElement>("#amplitude");
amplitude?.addEventListener("input", () => {
  document
    .querySelector<HTMLElement>(".wave-art")
    ?.style.setProperty("--amp", String(Number(amplitude.value) / 50));
  document.querySelector("#amplitude-value")!.textContent = amplitude.value;
});
const states = {
  ready: "Todo listo para empezar.",
  working: "Procesando tu idea…",
  done: "Listo. Cada detalle en su lugar.",
};
document
  .querySelectorAll<HTMLButtonElement>("[data-demo-state]")
  .forEach((button) =>
    button.addEventListener("click", () => {
      const state = button.dataset.demoState as keyof typeof states;
      document.querySelector<HTMLElement>(".interface-art")!.dataset.state =
        state;
      document.querySelector("#interface-status")!.textContent = states[state];
      document
        .querySelectorAll<HTMLButtonElement>("[data-demo-state]")
        .forEach((item) =>
          item.setAttribute("aria-pressed", String(item === button)),
        );
    }),
  );
// Magnetic feedback remains small and never replaces the native pointer.
document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((element) => {
  let pending = 0,
    x = 0,
    y = 0;
  element.addEventListener("pointermove", (event) => {
    if (!full() || !matchMedia("(pointer:fine)").matches) return;
    const rect = element.getBoundingClientRect();
    x = (event.clientX - rect.left - rect.width / 2) * 0.06;
    y = (event.clientY - rect.top - rect.height / 2) * 0.1;
    if (!pending)
      pending = requestAnimationFrame(() => {
        element.style.transform = `translate(${x}px,${y}px)`;
        pending = 0;
      });
  });
  const reset = () => {
    cancelAnimationFrame(pending);
    pending = 0;
    element.style.removeProperty("transform");
  };
  element.addEventListener("pointerleave", reset);
  document.addEventListener("skull:motion", reset);
  window.addEventListener("pagehide", reset);
});
