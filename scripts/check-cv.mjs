import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const manifest = JSON.parse(readFileSync("public/cv/manifest.json", "utf8"));
const hash = (path) =>
  createHash("sha256").update(readFileSync(path)).digest("hex");
for (const [path, expected] of Object.entries(manifest.sources))
  if (
    createHash("sha256")
      .update(readFileSync(path, "utf8").replace(/\r\n/g, "\n"))
      .digest("hex") !== expected
  )
    throw new Error(
      `CV source changed: ${path}. Run npm run cv to regenerate all formats.`,
    );
for (const [name, expected] of Object.entries(manifest.files))
  if (hash(`public/cv/${name}`) !== expected)
    throw new Error(`CV artifact changed: ${name}. Run npm run cv.`);
console.log("CV sources and exported files match their manifest.");
