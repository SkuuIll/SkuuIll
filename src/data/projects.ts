import catalog from "./projects.json";

const presentation: Record<
  string,
  {
    title?: string;
    label: string;
    tone: string;
    image?: string;
    alt?: string;
    caption?: string;
  }
> = {
  vigia: {
    title: "Vigía",
    label: "Operaciones conectadas",
    tone: "sage",
    image: "vigia-modules.webp",
    alt: "Selector real de los cuatro módulos de Vigía: Seguridad, Personal, Hotel y Administración.",
    caption: "Interfaz de Vigía · Entorno de demostración",
  },
  cpaul: {
    title: "Atelier de indumentaria 3D",
    label: "Comercio & personalización 3D",
    tone: "sand",
    image: "atelier-colors.webp",
    alt: "Interfaz real del Atelier de CPAUL, con una prenda tridimensional y controles de personalización.",
    caption: "Atelier de CPAUL · Captura real en entorno local de demostración",
  },
  "repo-setup": { label: "Herramientas para desarrollar", tone: "ink" },
  "pubg-map": {
    title: "Tactical Map",
    label: "Cartografía interactiva / PWA",
    tone: "olive",
    image: "tactical-map.webp",
    alt: "Interfaz real de Tactical Map con mapa interactivo de PUBG y herramientas de medición.",
    caption: "Captura de la aplicación web",
  },
  fluxnet: { label: "Android & redes", tone: "blue" },
  pipa: {
    title: "PIPAA / Panza Army",
    label: "Identidad digital de comunidad",
    tone: "orange",
    image: "pipa-web.webp",
    alt: "Portada del sitio de PIPAA y su comunidad Panza Army.",
    caption: "Captura del sitio web",
  },
  showroom: {
    title: "Catálogo comercial",
    label: "Productos & ventas",
    tone: "sand",
  },
  "mi-taller": {
    title: "Gestión de producción textil",
    label: "Presupuestos & producción",
    tone: "sage",
  },
  devblog: {
    title: "Plataforma editorial",
    label: "Django & contenido asistido",
    tone: "orange",
  },
  nfile: { label: "Android / software abierto", tone: "blue" },
};

export const projects = catalog.map((project) => {
  const visual = presentation[project.id];
  return {
    ...project,
    title: visual?.title || project.title,
    label:
      visual?.label ||
      (project.categories.includes("web")
        ? "Aplicación web"
        : "Software & herramientas"),
    tone: visual?.tone || "ink",
    image: visual?.image,
    alt: visual?.alt,
    caption: visual?.caption,
  };
});
export type Project = (typeof projects)[number];
export const selectedProjects = [
  "vigia",
  "cpaul",
  "pubg-map",
  "pipa",
  "repo-setup",
  "fluxnet",
].map((id) => projects.find((project) => project.id === id)!);
export const projectUrl = (id: string) =>
  `${import.meta.env.BASE_URL}proyectos/${id}/`;
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
