import { projects } from "../data/projects";
export function GET() {
  const paths = [
    "",
    "proyectos/",
    ...projects.map((project) => `proyectos/${project.id}/`),
  ];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>https://skuuill.github.io/SkuuIll/${path}</loc></url>`).join("")}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}
