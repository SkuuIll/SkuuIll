# Skull Signal: archivo de la dirección anterior

Estos recursos corresponden a la versión del 19 de octubre. La landing Skull del 20 de octubre utiliza geometría procedural original y no carga estas imágenes ni este video. Se conserva este documento como registro de procedencia.

Método: herramienta integrada `image_gen`, sin CLI de generación ni claves API locales. Fecha: 19 de octubre de 2026. Las imágenes se generaron desde descripciones originales y se optimizaron a WebP. Ningún recurso visual de Norris o Leclerc se copió al proyecto.

Archivos finales, relativos a la raíz del repositorio:

- `public/media/skull-cyber-hero.webp`: imagen principal, 1672 × 941.
- `public/media/skull-cyber-atelier.webp`: imagen secundaria, 1600 × 900.
- `public/media/skull-signal.webm`: secuencia animada de 12 segundos, sin audio.
- `public/media/skull-signal-poster.webp`: póster de la secuencia, 1280 × 800.

Los PNG originales también se conservan en el directorio local de imágenes generadas de Codex. El sitio consume solamente los archivos dentro de `public/media/`.

## Prompt final de la portada

> Use case: stylized-concept. Asset: ultra-wide cinematic website hero artwork, original identity for a software developer called Skull. Create an exceptionally polished high-end 3D editorial render of a futuristic abstract skull-shaped cybernetic mask, a sculptural artifact, NOT a person and NOT horror. Sleek black titanium and smoked chrome, precise engineered seams, delicate fiber-optic connections, bright controlled electric lime-green rim light on one side and deep cyan-blue reflections on the other. One large sculptural skull mask dominates the RIGHT HALF of the composition, angled slightly toward camera, cropped boldly, with stunning material detail. Left 45 percent must remain almost black with subtle atmospheric depth and clean negative space for large readable website typography. Background: near-black architectural void, faint volumetric haze, a few restrained technical light traces suggesting a digital atelier. Palette: obsidian black, electric green, cyan-blue; no purple, no warm beige. Sophisticated futuristic art direction like a premium motorsport campaign meets cyberpunk design studio. Landscape widescreen 16:9 or wider, crisp and cinematic. NO words, NO letters, NO logos, NO watermark, NO UI panels, NO screenshots, NO race cars, NO brand references. The asset is entirely original.

## Prompt final del atelier conceptual

> Use case: stylized-concept. Asset: original cinematic landscape background for a cyberpunk software portfolio project navigation scene. A vast futuristic underground digital fabrication atelier, a dramatic architectural tunnel of black brushed metal, precision titanium ribs, luminous red light lines and a distant icy cyan-blue vanishing point. On the right, an abstract hovering chrome ring holding fragments of a holographic garment silhouette and tiny geometric data fragments; it should read as sculptural digital fabrication and systems design rather than an actual product screenshot. Expensive cinematic 3D art direction, photoreal materials, strong perspective, restrained volumetric haze, deep blacks, high contrast red and black with a little cyan, not purple. Foreground left and bottom must have spacious dark areas for website text. Wide 16:9 framing. No people, no cars, no text, no letters, no brands, no watermarks, no dashboard graphics. Original illustration, not borrowed from a film or game.

## Animación

`scripts/render-signal-film.mjs` compone cámara, partículas y luz sobre el arte principal mediante Canvas. FFmpeg codifica el resultado como VP9. Es una animación del arte generado, no una grabación de producto, una escena WebGL interactiva ni un video generado por un modelo de video. Las capturas reales del Atelier y Vigía siguen identificadas en sus secciones.
