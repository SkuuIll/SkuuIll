# Portafolio web de Skull

Sitio público: <https://skuuill.github.io/SkuuIll/>. El proyecto usa Astro y genera archivos estáticos para GitHub Pages.

## Estructura actual

- `src/pages/index.astro`: portada, campo procedural, experimentos y proceso.
- `src/pages/proyectos/index.astro`: archivo con búsqueda y filtros.
- `src/pages/proyectos/[slug].astro`: páginas de casos generadas desde el catálogo.
- `src/layouts/Layout.astro`: documento, preferencias y navegación por capítulos.
- `src/data/projects.json` y `projects.ts`: catálogo y presentación de cada caso.
- `src/components/Contact.astro`: contacto y formulario de consulta.
- `src/components/AtelierFeature.astro`: galería real y muestra 3D bajo demanda.
- `src/scripts/site.ts` y `landing.ts`: preferencias, campo procedural, scroll, laboratorio y formularios.
- `src/styles/`: base de casos, sistema visual compartido y landing Skull.
- `public/media/` y `public/models/`: recursos locales publicados.

`/site/` y los enlaces antiguos con `?caso=` conservan compatibilidad. El contenido actual se mantiene en las fuentes de Astro.

## Actualizar proyectos

Editar el catálogo en `src/data/projects.json` y sus recursos de presentación en `projects.ts`. Mantener identificadores únicos y enlaces válidos. Las fichas distinguen proyectos propios, código privado, forks y prototipos; conservar las atribuciones y evitar detalles internos de proyectos privados.

La landing demuestra habilidades; las fichas del archivo conservan sus páginas con URL propia. La búsqueda del archivo ignora mayúsculas y acentos. Revisar las pruebas de catálogo cuando cambie el número de proyectos.

## Contacto, accesibilidad y privacidad

La consulta prepara un borrador local para abrir desde el correo del visitante; también permite copiar o descargar el texto. No envía mensajes desde un servidor.

Sin JavaScript permanecen contenido, enlaces y los tres experimentos del laboratorio. El menú modal cierra con Escape y devuelve el foco al control que lo abrió. Los tabs admiten flechas, Inicio y Fin. El movimiento reducido y la pausa se respetan; el campo procedural tiene una alternativa SVG. El CV no forma parte del sitio público.

## Verificación y publicación

`npm run lint`, `npm run check:privacy` y `npm test` validan tipos, documentación, privacidad, recursos, interacción y accesibilidad. El workflow **Portfolio Quality and Pages** ejecuta los controles y publica `dist/` desde `main`. La evidencia local se guarda en `.qa/`, fuera de los archivos publicados.

Ver [apariencia](appearance.md), [movimiento](motion.md) y [procedencia de medios](media.md).
