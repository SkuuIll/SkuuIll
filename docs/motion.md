# Movimiento e interacción de Skull

## Siempre activo

La landing inicia con todos los efectos activos. Se retiraron el selector, los estados y el aviso de activación a pedido del propietario. Las preferencias antiguas de pausa y reducción se descartan; el sitio no modifica ajustes del sistema operativo. El ahorro de datos limita la calidad gráfica, sin desactivar la experiencia.

El campo de portada proyecta geometría tridimensional sobre Canvas 2D con GSAP ScrollTrigger para entradas y relato. Usa 440 puntos en escritorio y 216 en pantallas táctiles o ahorro de datos. Conserva una alternativa SVG.

## Observatorio espacial

Una ilustración original generada para esta landing se sirve como WebP local de 235 KiB. Un shader WebGL2 aplica paralaje según un campo de profundidad dirigido artísticamente. El cursor y el scroll móvil cambian el punto de vista, y un control permite ajustar su intensidad. Es una experiencia 2.5D: no es una reconstrucción completa de la escena ni Gaussian splatting.

## Umbral

Un recorrido geométrico realmente tridimensional usa Three.js: portales, partículas, niebla y una escultura facetada. La cámara avanza y gira con el scroll nativo, sin capturar rueda ni gestos. Tres capítulos cambian según el recorrido. El enlace al laboratorio permite saltarlo.

Three.js se importa dinámicamente al aproximarse a estas secciones. Cada escena renderiza solamente si está visible, la pestaña está activa y el menú está cerrado. DPR máximo 1,5; en móvil y ahorro de datos, 1. Las geometrías, texturas y contextos se liberan al abandonar la página. Sin WebGL o scripts permanecen la ilustración y los portales CSS.

## Laboratorio y plataforma web

Los experimentos conservan teclado, controles reales y alternativas sin JavaScript. Las pestañas usan transiciones limitadas al componente cuando existe `Element.startViewTransition`, con fallback mediante Web Animations. Las interacciones se pueden interrumpir. El progreso del recorrido usa una línea de tiempo CSS nativa donde hay soporte y una variable calculada por scroll en los demás navegadores. `corner-shape: squircle` mejora el marco espacial si está disponible.

Estas mejoras se eligieron tras consultar la [actualización oficial de Web UI de julio de 2026](https://developer.chrome.com/blog/new-in-web-ui-io26). Las transiciones por elemento son recientes; el paralaje de profundidad y los recorridos 3D son técnicas conocidas, aplicadas aquí en una composición original.

## Validación

Las suites de Playwright comprueban activación inmediata, preferencias antiguas, teclado, controles, suspensiones, fallbacks, contraste, formularios, 21 rutas y privacidad. La revisión visual se realiza con Edge instalado en escritorio y móvil. Los bucles se suspenden automáticamente sin introducir nuevamente controles de activación en la portada.
