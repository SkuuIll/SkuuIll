# Portafolio de Skull

Sitio estático con Astro, TypeScript, GSAP y fuentes locales. La dirección pública prevista para esta versión es <https://skuuill.github.io/SkuuIll/>. Las rutas se construyen con el prefijo `/SkuuIll/`, incluido el acceso al CV.

## Desarrollo y verificación

Requiere Node.js 22.22 o posterior; CI utiliza Node.js 24.

```bash
npm ci
npx playwright install chromium
npm run dev
```

Comprobaciones y compilación:

```bash
npm run lint
npm run check:cv
npm test
npm run build
npm run preview
```

`npm test` inicia su propio build y servidor de vista previa si no hay uno disponible. El puerto de prueba es 4179. Para comprobar cambios en producción estática con un servidor ya abierto, ejecutar primero `npm run build`.

## Estructura

| Ruta | Contenido |
| :--- | :--- |
| `src/pages/index.astro` | Inicio, selección visual, secuencia de Vigía, perfil y contacto. |
| `src/pages/proyectos/` | Archivo buscable y páginas estáticas de los 21 proyectos. |
| `src/pages/cv/` | CV web y estilos de impresión. |
| `src/data/profile.ts` | Identidad, formación y capacidades compartidas. |
| `src/data/projects.json` | Contenido y alcance de los casos. |
| `src/data/projects.ts` | Presentación, imágenes y nombres descriptivos. |
| `src/scripts/site.ts` | Navegación móvil, movimiento, escenas, filtros y consulta. |
| `src/styles/global.css` | Diseño, responsive, preferencias y transiciones. |
| `public/media/` | Capturas, recursos de campaña y vista previa social. |
| `public/cv/` | PDFs, HTML editable y manifiesto de generación. |
| `dist/` | Salida de Astro; es la carpeta que debe publicar Pages. |

La carpeta `site/` y el `index.html` de la raíz conservan la implementación anterior como antecedente. Astro genera la web desde `src/`; no publicar directamente la raíz del repositorio para esta versión. `/site/` tiene una ruta de compatibilidad que conserva enlaces antiguos a casos y referencias.

## Movimiento e interacción

La portada tiene entrada breve y parallax discreto. En escritorio, la sección Vigía mantiene una imagen visible mientras el scroll recorre sus cuatro áreas. Los botones permiten explorar las capturas en móvil o sin la secuencia larga.

Las preferencias de movimiento reducido eliminan los efectos no esenciales. El control del pie permite pausar el movimiento y recuerda la elección durante la sesión. Las transiciones nativas entre páginas se activan con scripting disponible y sin preferencia de movimiento reducido; la navegación normal sigue funcionando sin JavaScript.

Tres acentos de color alternan al recargar el inicio o entrar desde fuera del sitio. Dentro del portafolio se conserva la paleta. Se puede cambiar manualmente desde el pie. El bloqueo del almacenamiento no impide usar la web.

El correo directo funciona sin scripts. La consulta ampliada se ofrece con JavaScript: valida campos, prepara un borrador y permite copiarlo, descargarlo o abrirlo en el cliente de correo. El visitante envía el mensaje desde su correo; no hay backend de envío ni almacenamiento de consultas.

## CV y recursos

Para regenerar el CV tras modificar sus fuentes:

```bash
npm run cv
npm run check:cv
```

El comando compila el sitio, exporta un PDF de presentación, un PDF de lectura simple para ATS y un HTML editable sin conexión, y vuelve a compilar para incluir los archivos nuevos. Requiere el Chromium de Playwright. El manifiesto detecta cambios en fuentes o archivos exportados que requieran regeneración.

La versión HTML editable permite modificar texto en el navegador, guardar una nueva copia HTML e imprimirla como PDF. Sus fuentes están embebidas. Los enlaces externos requieren conexión.

Para la identidad gráfica y capturas de revisión:

```bash
npm run branding
npm run build
npm run preview
npm run review:visual
```

Revisar las páginas de ambos PDF después de regenerarlos; la comprobación del manifiesto no reemplaza esa inspección. Consultar [procedencia de medios](media.md) antes de cambiar imágenes.

## Publicación

La versión anterior de Pages usaba `main` y la raíz en modo `legacy`. Esta versión necesita Pages con **GitHub Actions**, porque publica el build de Astro.

El workflow de calidad comprueba Markdown, tipado, coherencia del CV y Playwright. En `main`, prepara `dist/` como artefacto de Pages y despliega únicamente esa salida. Las métricas y la animación de contribuciones mantienen sus workflows independientes.

Después del despliegue, comprobar la URL real, recursos, rutas de proyectos, compatibilidad de `/site/`, enlaces del README y descarga de cada versión del CV. Un workflow correcto por sí solo no demuestra que todos esos accesos funcionen.
