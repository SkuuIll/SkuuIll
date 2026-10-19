# Portafolio web de Skull

Sitio público: <https://skuuill.github.io/SkuuIll/>.

## Estructura

- `index.html`: entrada corta que redirige a `site/`, conservando parámetros y ancla.
- `site/index.html`: contenido estático, catálogo y plantillas de las fichas.
- `site/assets/styles.css`: diseño base y animaciones del sitio.
- `site/assets/portfolio.css`: catálogo, perfil, trayectoria y diálogos.
- `site/assets/palette.js`: cinco ambientes de color, con alternancia entre visitas.
- `site/assets/app.js`: consulta, firma, movimiento y efectos base.
- `site/assets/portfolio.js`: búsqueda, filtros, fichas y consulta contextual.
- `site/assets/social-cover.svg`: fuente editable de la portada para compartir.
- `site/assets/social-cover.png`: versión raster para Open Graph.

## Actualizar proyectos

Cada tarjeta tiene un `data-id`, categorías en `data-category` y un botón
`data-case`. Su ficha está en un elemento `template` con identificador
`case-IDENTIFICADOR`. Mantener esos identificadores sincronizados.

Los seis proyectos destacados usan `data-featured="true"`. La búsqueda ignora
mayúsculas y acentos. Los enlaces `?caso=IDENTIFICADOR` abren una ficha específica.
Actualizar también el total estático y la prueba del catálogo si cambia su tamaño.

Las ilustraciones de tarjetas son conceptuales, no capturas de productos. Las
fichas distinguen código público, privado, forks y prototipos. Mantener la
atribución de NFile y no publicar detalles internos de proyectos privados.

## Contacto y accesibilidad

La consulta prepara un correo para abrir en el cliente del visitante; no envía
mensajes desde un servidor. También permite copiar o descargar el texto.

Sin JavaScript, el contenido y los enlaces siguen disponibles, se muestran todos
los proyectos y se conserva el contacto alternativo. Las fichas interactivas usan
un diálogo nativo con cierre por Escape y retorno del foco al botón de origen.

El sitio respeta `prefers-reduced-motion` y permite pausar animaciones. La paleta
funciona aunque el almacenamiento local esté bloqueado.

## Verificación

El workflow Landing Quality ejecuta las pruebas de Playwright y axe: cuatro anchos
de pantalla, navegación, teclado, formularios, cinco paletas, catálogo y fichas.
También conserva capturas de escritorio y móvil en el artefacto de la ejecución.
GitHub Pages publica desde la raíz de la rama principal.
