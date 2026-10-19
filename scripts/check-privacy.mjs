import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const failures = [];
for (const path of ["public/cv", "src/pages/cv", "dist/cv", "site/index.html"])
  if (existsSync(path))
    failures.push(`Private route or legacy content exists: ${path}`);
function scan(path) {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const file = join(path, entry.name);
    if (entry.isDirectory()) scan(file);
    else if (/\.(html|astro|ts|js|json|xml|txt|md)$/i.test(file)) {
      const text = readFileSync(file, "utf8");
      if (
        /Facundo|Escobedo|Profesorado|Electromecánico|Fray Mamerto|href=["']?[^\s]*\/cv\//i.test(
          text,
        )
      )
        failures.push(`Private CV content in ${file}`);
    }
  }
}
for (const dir of ["src", "public", ...(existsSync("dist") ? ["dist"] : [])])
  scan(dir);
if (failures.length) throw Error(failures.join("\n"));
console.log(
  "Public sources and build contain no private CV routes or personal education data.",
);
