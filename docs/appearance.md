# Identidad y apariencia

El nombre visible es **Skull**. La cuenta y los enlaces de GitHub conservan `SkuuIll`. La dirección **Skull Signal** combina negro, verde eléctrico y azul con una escena secundaria roja y negra. El arte y sus prompts están documentados en [arte cyberpunk](cyberpunk-art.md).

## Temas y ambientes

La primera entrada usa modo oscuro. El botón de apariencia permite elegir claro u oscuro y guarda la elección en `localStorage`. El sitio conserva una alternativa funcional si el navegador bloquea ese almacenamiento.

Los tres ambientes son **Matrix** (verde), **Ion** (azul) y **Pulse** (rojo). Se guardan durante la sesión y cambian entre nuevas entradas a la portada; los identificadores internos `forest`, `blue` y `clay` mantienen compatibilidad con preferencias anteriores. El botón del pie permite recorrerlos.

Los colores se definen en `src/styles/cyber.css`; los detalles de exposiciones y componentes permanecen en `experience.css`. La inicialización de preferencias está en `Layout.astro` y sus controles en `src/scripts/site.ts`.

## Movimiento

La presentación inicial es breve y se puede saltar. El menú de capítulos ocupa la pantalla completa y los paneles de proyectos admiten mouse y teclado. El video de identidad tiene una alternativa estática; no se utiliza como prueba de un producto real. Las capturas del trabajo se mantienen en sus secciones correspondientes.

El control **Pausar movimiento** comparte su estado con la portada y persiste durante la sesión. La preferencia del sistema de reducir movimiento tiene prioridad. El video se detiene fuera de pantalla, al ocultar la pestaña y detrás del menú; el ahorro de datos requiere reproducción manual. Ver [dirección de movimiento](motion.md).

## Verificación

Las suites de Playwright y axe revisan ambos temas, los tres ambientes, navegación, formularios, teclado, paneles y funcionamiento sin JavaScript. `scripts/review-edge.mjs` comprueba además la experiencia en la instalación local de Microsoft Edge.
