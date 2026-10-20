import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";
function cover(width, height) {
  const rings = Array.from(
    { length: 16 },
    (_, i) =>
      `<ellipse cx="${width * 0.8}" cy="${height * 0.5}" rx="${height * (0.24 + i * 0.013)}" ry="${height * (0.42 - i * 0.014)}" transform="rotate(${i * 11} ${width * 0.8} ${height * 0.5})" fill="none" stroke="${i % 3 ? "#4ce1c7" : "#72a6ff"}" stroke-opacity=".32"/>`,
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc"><title id="title">Skull — Diseño, código e interacción</title><desc id="desc">Un campo geométrico de señales en menta y azul sobre grafito.</desc><rect width="${width}" height="${height}" fill="#080d13"/>${rings}<g font-family="Arial,sans-serif"><text x="48" y="48" fill="#a0b4bf" font-size="12" letter-spacing="2">SKULL / DIGITAL LAB</text><text x="40" y="${height * 0.53}" font-size="${height * 0.32}" fill="#edf5f7" font-weight="700" letter-spacing="-10">Skull<tspan fill="#4ce1c7">.</tspan></text><text x="48" y="${height * 0.71}" fill="#edf5f7" font-size="28">Diseño interfaces que responden.</text><text x="48" y="${height - 40}" fill="#a0b4bf" font-size="13" letter-spacing="1">DISEÑO + CÓDIGO + INTERACCIÓN / ARGENTINA</text></g><path d="M48 70H${width - 48}M48 ${height - 72}H${width - 48}" stroke="#293944"/></svg>`;
}
mkdirSync("assets", { recursive: true });
mkdirSync("public/media", { recursive: true });
writeFileSync("assets/profile-cover-2026.svg", cover(1280, 420));
await sharp(Buffer.from(cover(1200, 630)))
  .png()
  .toFile("public/media/social-cover.png");
console.log("Skull profile and social covers generated.");
