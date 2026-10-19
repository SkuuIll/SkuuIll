import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import sharp from "sharp";
import { spawn } from "node:child_process";
import { once } from "node:events";
const encoder = process.env.FFMPEG_PATH;
if (!encoder)
  throw Error("Set FFMPEG_PATH to a local FFmpeg with VP9 encoding.");
const input = "skull-cyber-hero.webp";
const url =
  "data:image/webp;base64," +
  readFileSync("public/media/" + input).toString("base64");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  await page.evaluate(async (url) => {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 800;
    document.body.append(canvas);
    const ctx = canvas.getContext("2d", { alpha: false });
    window.renderFrame = (t) => {
      const phase = (t * Math.PI) / 6;
      ctx.fillStyle = "#050a10";
      ctx.fillRect(0, 0, 1280, 800);
      const scale =
        Math.max(1280 / image.width, 800 / image.height) *
        (1.045 + Math.sin(phase) * 0.024);
      const w = image.width * scale,
        h = image.height * scale;
      ctx.drawImage(
        image,
        (1280 - w) / 2 + Math.sin(phase) * 14,
        (800 - h) / 2 + Math.cos(phase) * 8,
        w,
        h,
      );
      for (let i = 0; i < 40; i++) {
        const x = (i * 137.53 + Math.sin(phase + i) * 14) % 1280;
        const y = (i * 73.81 + Math.cos(phase + i) * 18) % 800;
        ctx.globalAlpha = 0.12 + Math.sin(phase + i) * 0.1;
        ctx.fillStyle = i % 2 ? "#a8ff55" : "#50dfff";
        ctx.fillRect(x, y, i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1);
      }
      ctx.globalAlpha = 1;
      const x = 700 + Math.sin(phase) * 430;
      const gradient = ctx.createLinearGradient(x - 80, 0, x + 80, 0);
      gradient.addColorStop(0, "#54dfff00");
      gradient.addColorStop(0.5, "#54dfff0d");
      gradient.addColorStop(1, "#54dfff00");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1280, 800);
      return canvas.toDataURL("image/jpeg", 0.9).split(",")[1];
    };
  }, url);
  const poster = await page.evaluate(() => window.renderFrame(0));
  await sharp(Buffer.from(poster, "base64"))
    .webp({ quality: 86 })
    .toFile("public/media/skull-signal-poster.webp");
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
      "1100k",
      "-pix_fmt",
      "yuv420p",
      "-an",
      "public/media/skull-signal.webm",
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
      file: "public/media/skull-signal.webm",
      bytes: readFileSync("public/media/skull-signal.webm").length,
      input,
      duration: 12,
    }),
  );
} finally {
  await browser.close();
}
