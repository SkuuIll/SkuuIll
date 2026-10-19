"use strict";

// Run before the stylesheet is painted. Only the visual preference is stored.
(() => {
  const palettes = [
    { name: "Lima", bg: "#080f0c", soft: "#0d1712", accent: "#c8ff41", glow: "130, 240, 92", secondary: "85, 120, 255" },
    { name: "Océano", bg: "#07121c", soft: "#0b1b29", accent: "#a8e8ff", glow: "48, 182, 255", secondary: "127, 92, 246" },
    { name: "Aurora", bg: "#130b20", soft: "#1d1330", accent: "#d7b8ff", glow: "172, 110, 255", secondary: "54, 220, 194" },
    { name: "Coral", bg: "#1a0b15", soft: "#281320", accent: "#ffbfca", glow: "255, 97, 159", secondary: "147, 105, 255" },
    { name: "Ámbar", bg: "#171006", soft: "#241b0e", accent: "#ffd18a", glow: "255, 173, 62", secondary: "214, 76, 136" },
  ];
  let previous = -1;
  try {
    const stored = localStorage.getItem("skull-portfolio-palette");
    if (stored !== null && /^[0-4]$/.test(stored)) previous = Number(stored);
  } catch { /* Storage can be disabled without disabling the site. */ }

  function changePalette() {
    const index = previous < 0
      ? Math.floor(Math.random() * palettes.length)
      : (previous + 1 + Math.floor(Math.random() * (palettes.length - 1))) % palettes.length;
    const palette = palettes[index];
    const root = document.documentElement;
    root.dataset.palette = String(index);
    for (const key of ["bg", "soft", "accent", "glow", "secondary"]) {
      root.style.setProperty(`--${key}`, palette[key]);
    }
    root.style.setProperty("--muted", "#b4bdbb");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", palette.bg);
    const label = document.querySelector("#palette-name");
    if (label) label.textContent = palette.name;
    previous = index;
    try { localStorage.setItem("skull-portfolio-palette", String(index)); } catch { /* Optional preference. */ }
    return palette.name;
  }
  window.skullAppearance = { changePalette, currentName: () => palettes[previous].name };
  changePalette();
  window.addEventListener("pageshow", event => {
    if (event.persisted) changePalette();
  });
})();
