const root = document.documentElement;
const canAnimate = () =>
  !matchMedia("(prefers-reduced-motion: reduce)").matches &&
  root.dataset.motion !== "paused";
const intro = document.querySelector<HTMLDialogElement>("#boot-intro");
if (intro) {
  let seen = false;
  try {
    seen = sessionStorage.getItem("skull-intro-seen") === "true";
  } catch {}
  if (!seen && !location.hash && canAnimate()) {
    intro.showModal();
    try {
      sessionStorage.setItem("skull-intro-seen", "true");
    } catch {}
    const finish = () => {
      clearTimeout(timer);
      intro.close();
    };
    const timer = window.setTimeout(finish, 1350);
    intro.querySelector("#skip-intro")?.addEventListener("click", finish);
    intro.addEventListener("cancel", finish);
    window.addEventListener("pagehide", finish, { once: true });
  }
}
const tabs = [
  ...document.querySelectorAll<HTMLButtonElement>("[data-deck-tab]"),
];
const panels = [...document.querySelectorAll<HTMLElement>("[data-deck-panel]")];
if (tabs.length && panels.length) {
  const list = document.querySelector<HTMLElement>(".deck-tabs")!;
  list.hidden = false;
  list.setAttribute("role", "tablist");
  function select(index: number, focus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(i === index));
      tab.setAttribute("aria-controls", panels[i].id);
      tab.tabIndex = i === index ? 0 : -1;
    });
    panels.forEach((panel, i) => {
      panel.getAnimations().forEach((a) => a.cancel());
      panel.hidden = i !== index;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabs[i].id);
      panel.tabIndex = 0;
    });
    if (focus) tabs[index].focus();
    if (canAnimate())
      panels[index].animate(
        [
          { opacity: 0, transform: "translateY(20px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 450, easing: "cubic-bezier(.16,1,.3,1)" },
      );
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(index));
    tab.addEventListener("keydown", (event) => {
      let next: number | undefined;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft")
        next = (index + tabs.length - 1) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        select(next, true);
      }
    });
  });
  select(0);
  document.addEventListener("skull:motion", () => {
    if (!canAnimate())
      panels.forEach((panel) =>
        panel.getAnimations().forEach((a) => a.cancel()),
      );
  });
}
