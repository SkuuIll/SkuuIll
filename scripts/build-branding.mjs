import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";
const cover = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="420" viewBox="0 0 1280 420" role="img" aria-labelledby="title desc"><title id="title">Skull — Desarrollo de software</title><desc id="desc">Web, Android, escritorio y Linux desde Chaco, Argentina.</desc><rect width="1280" height="420" fill="#f4f2ec"/><path d="M48 66h1184M48 350h1184M870 105v205" stroke="#d7d7cc"/><g fill="#252720" font-family="Arial,sans-serif"><text x="48" y="43" font-size="12" letter-spacing="2">SKUUIll / SOFTWARE DEVELOPER</text><text x="1230" y="43" font-size="11" text-anchor="end" letter-spacing="1">CHACO, ARGENTINA</text><text x="42" y="196" font-size="116" font-weight="600" letter-spacing="-7">Skull<tspan fill="#b63f23">.</tspan></text><text x="48" y="257" font-size="32" letter-spacing="-1">De la interfaz al sistema.</text><text x="48" y="304" font-size="18" fill="#65695f">Web · Android · Escritorio · Linux · Automatización</text><text x="48" y="390" font-size="13" letter-spacing="1">PROYECTOS / PRODUCTOS / HERRAMIENTAS</text><text x="1232" y="390" text-anchor="end" font-size="13">github.com/SkuuIll</text></g><path d="M1134 125h-134l-61 72 209 49-61 71H949" fill="none" stroke="#b63f23" stroke-width="21"/><path d="M1106 89v65M1073 122h66" fill="none" stroke="#b63f23" stroke-width="9"/></svg>`;
mkdirSync("assets", { recursive: true });
mkdirSync("public/media", { recursive: true });
writeFileSync("assets/profile-cover-2026.svg", cover);
await sharp(Buffer.from(cover))
  .resize(1200, 630, { fit: "contain", background: "#f4f2ec" })
  .png()
  .toFile("public/media/social-cover.png");
console.log("Profile cover and social preview generated.");
