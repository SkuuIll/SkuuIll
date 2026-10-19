import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import sharp from "sharp";
import { spawn } from "node:child_process";
import { once } from "node:events";
const encoder = process.env.FFMPEG_PATH;
if (!encoder)
  throw Error("Set FFMPEG_PATH to a local ffmpeg with VP9 encoding.");
const inputs = ["atelier-colors.webp", "vigia-hotel.webp", "vigia-gps.webp"];
const images = inputs.map(
  (name) =>
    "data:image/webp;base64," +
    readFileSync("public/media/" + name).toString("base64"),
);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  await page.evaluate(async (urls) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 800;
    document.body.append(canvas);
    const ctx = canvas.getContext("2d", { alpha: false });
    const images = await Promise.all(
      urls.map(
        (src) =>
          new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = src;
          }),
      ),
    );
    const ease = (t) => t * t * (3 - 2 * t);
    function draw(t) {
      ctx.fillStyle = "#0c181b";
      ctx.fillRect(0, 0, 1280, 800);
      const light = ctx.createRadialGradient(1000, 180, 20, 900, 400, 850);
      light.addColorStop(0, "#334944");
      light.addColorStop(1, "#0c181b");
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, 1280, 800);
      ctx.strokeStyle = "#b8c9ba14";
      ctx.lineWidth = 1;
      for (let x = -100; x < 1400; x += 90) {
        ctx.beginPath();
        ctx.moveTo(x + ((t * 5) % 90), 0);
        ctx.lineTo(x + ((t * 5) % 90), 800);
        ctx.stroke();
      }
      const phase = t / 4;
      const current = Math.floor(phase) % 3;
      const fraction = phase % 1;
      const blend = ease(Math.max(0, Math.min(1, (fraction - 0.68) / 0.32)));
      const render = (index, alpha) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(
          760 + Math.sin((t * Math.PI) / 6) * 14,
          400 + Math.cos((t * Math.PI) / 6) * 10,
        );
        ctx.rotate(-0.045 + Math.sin((t * Math.PI) / 6) * 0.012);
        const w = 1100 + Math.sin((t * Math.PI) / 6) * 18,
          h = w * 0.625;
        ctx.shadowColor = "#0009";
        ctx.shadowBlur = 45;
        ctx.shadowOffsetY = 26;
        ctx.fillStyle = "#182326";
        ctx.fillRect(-w / 2 - 8, -h / 2 - 8, w + 16, h + 16);
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.drawImage(
          images[index],
          0,
          0,
          images[index].width,
          images[index].height,
          -w / 2,
          -h / 2,
          w,
          h,
        );
        ctx.restore();
      };
      render(current, 1);
      if (blend > 0) render((current + 1) % 3, blend);
    }
    window.renderFrame = (t) => {
      draw(t);
      return canvas.toDataURL("image/jpeg", 0.88).split(",")[1];
    };
  }, images);
  const poster = await page.evaluate(() => window.renderFrame(0));
  await sharp(Buffer.from(poster, "base64"))
    .webp({ quality: 86 })
    .toFile("public/media/product-film-poster.webp");
  const proc = spawn(
    encoder,
    [
      "-y",
      "-f",
      "image2pipe",
      "-framerate",
      "24",
      "-c:v",
      "mjpeg",
      "-i",
      "pipe:0",
      "-c:v",
      "libvpx-vp9",
      "-b:v",
      "900k",
      "-pix_fmt",
      "yuv420p",
      "-an",
      "public/media/product-film.webm",
    ],
    { stdio: ["pipe", "ignore", "pipe"], windowsHide: true },
  );
  let errors = "";
  proc.stderr.on("data", (data) => (errors += data));
  const completed = once(proc, "close");
  for (let frame = 0; frame < 288; frame++) {
    const jpeg = await page.evaluate((t) => window.renderFrame(t), frame / 24);
    if (!proc.stdin.write(Buffer.from(jpeg, "base64")))
      await once(proc.stdin, "drain");
  }
  proc.stdin.end();
  const [code] = await completed;
  if (code !== 0) throw Error(errors);
  console.log(
    JSON.stringify({
      file: "public/media/product-film.webm",
      bytes: readFileSync("public/media/product-film.webm").length,
      duration: 12,
      inputs,
    }),
  );
} finally {
  await browser.close();
}
