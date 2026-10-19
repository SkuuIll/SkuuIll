const hero = document.querySelector<HTMLElement>(".cinema-hero");
const film = hero?.querySelector<HTMLVideoElement>(".cinema-film");
if (hero && film) {
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const status = hero.querySelector<HTMLElement>(".cinema-status")!;
  const play = hero.querySelector<HTMLButtonElement>("#film-play")!;
  const toggle = hero.querySelector<HTMLButtonElement>("#cinema-toggle")!;
  hero.querySelector<HTMLElement>(".cinema-preferences")!.hidden = false;
  let visible = false;
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  let blocked = Boolean(connection?.saveData);
  let failed = false;
  let generation = 0;
  const allowed = () => !reduced.matches && root.dataset.motion !== "paused";
  const sync = async () => {
    const current = ++generation;
    const paused = root.dataset.motion === "paused";
    toggle.textContent = paused ? "Activar experiencia" : "Pausar experiencia";
    toggle.setAttribute("aria-pressed", String(paused));
    status.textContent = reduced.matches
      ? "Movimiento reducido por el sistema"
      : paused
        ? "Movimiento pausado"
        : failed
          ? "Fondo estático"
          : blocked
            ? "Fondo en pausa"
            : "Movimiento activo";
    play.hidden = !blocked || !allowed() || failed;
    const overlayOpen = [
      ...document.querySelectorAll<HTMLDialogElement>("dialog"),
    ].some((dialog) => dialog.open);
    if (
      !allowed() ||
      !visible ||
      document.hidden ||
      failed ||
      blocked ||
      overlayOpen
    ) {
      film.pause();
      return;
    }
    if (!film.src) {
      film.src = film.dataset.src!;
      film.muted = true;
    }
    try {
      await film.play();
      if (current !== generation) return;
      if (!allowed() || !visible || document.hidden) film.pause();
    } catch {
      if (current !== generation) return;
      if (allowed() && visible && !document.hidden) {
        blocked = true;
        void sync();
      }
    }
  };
  film.addEventListener("playing", () => film.classList.add("is-ready"));
  film.addEventListener("error", () => {
    failed = true;
    film.classList.remove("is-ready");
    void sync();
  });
  toggle.addEventListener("click", () =>
    document.querySelector<HTMLButtonElement>("#motion-toggle")?.click(),
  );
  play.addEventListener("click", () => {
    blocked = false;
    void sync();
  });
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      void sync();
    },
    { threshold: 0.05 },
  );
  observer.observe(hero);
  const overlays = new MutationObserver(() => void sync());
  document
    .querySelectorAll("dialog")
    .forEach((dialog) =>
      overlays.observe(dialog, { attributes: true, attributeFilter: ["open"] }),
    );
  reduced.addEventListener("change", () => void sync());
  document.addEventListener("visibilitychange", () => void sync());
  document.addEventListener("skull:motion", () => void sync());
  window.addEventListener("pagehide", () => {
    generation++;
    film.pause();
  });
  window.addEventListener("pageshow", () => void sync());
  void sync();
}
