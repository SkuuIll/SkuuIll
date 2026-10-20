# Movimiento e interacción de Spulp

La dirección visual toma como referencia el ritmo editorial y las capas de las webs de [Lando Norris](https://landonorris.com/) y [Charles Leclerc](https://charlesleclerc.com/en/), revisadas en la etapa anterior. La implementación actual utiliza geometría y código originales.

## Campo procedural

`src/scripts/landing.ts` proyecta un campo tridimensional sobre un único Canvas 2D: esfera, onda y conexiones. El desplazamiento transforma la geometría; el puntero modifica su orientación con interpolación suave. La escena se mantiene visible mediante posición sticky durante una secuencia breve, sin interceptar rueda, gestos ni scroll nativo. En móvil el relato es vertical y no fija sus textos.

La escena usa 440 puntos en escritorio y 216 en dispositivos táctiles o ahorro de datos. El DPR se limita a 1,5 y 1,25 respectivamente. Un solo `requestAnimationFrame` dibuja la escena. El bucle se cancela fuera de pantalla, al ocultar la pestaña, durante el menú y al salir de la página. `pagehide` desconecta observadores y cancela animaciones; una restauración desde bfcache vuelve a registrarlos. El SVG queda visible si falla Canvas o se pierde su contexto.

GSAP ScrollTrigger anima entradas, el desplazamiento de la firma y la línea de proceso. Se revierte al reducir o pausar el movimiento. Las transiciones entre documentos son nativas, con navegación normal en navegadores sin soporte. La entrada es inmediata: no hay un loader artificial que retrase el contenido.

## Preferencias compartidas

- **Automático:** respeta movimiento reducido del sistema y ahorro de datos.
- **Completo:** elección manual que habilita efectos, aunque el sistema solicite reducción. No cambia la configuración del sistema.
- **Reducido:** composición estática y cambios de estado esenciales.
- **Pausar:** detiene la decoración en cualquier modo y recuerda la pausa durante la sesión. Reanudar conserva el modo elegido.

`site.ts` centraliza la preferencia en `data-effects`, `data-motion-mode` y `data-motion`. El campo, GSAP, CSS y la galería del caso Atelier comparten ese estado. El selector conserva la elección en `localStorage`; funciona también con almacenamiento bloqueado.

## Laboratorio

Composición modifica densidad y distribución de una retícula. Movimiento modifica la amplitud de una onda; el pulso se detiene con la preferencia compartida. Interfaces muestra estados manuales listo/procesando/completado; es una demostración sin envío de datos. Las pestañas admiten flechas, Inicio y Fin. Sin JavaScript las tres composiciones permanecen visibles y los controles inactivos quedan ocultos.

## Revisión

`tests/landing.spec.js` cubre preferencias, pausa persistente, puntero, salida de pantalla, menú, pérdida/recuperación de contexto, Canvas ausente, controles, teclado, contraste y alternativa sin scripts. Las otras suites conservan formularios, 21 casos, visor de prenda y privacidad.

`node scripts/review-edge.mjs` captura seis tamaños y ambos temas con Edge instalado. La variable `REVIEW_URL` permite comprobar la publicación. Registra errores, desbordes, CTA visible, recursos iniciales y tiempos de rAF; estos últimos son una observación de laboratorio, no una garantía de FPS en otros equipos. `node scripts/audit-lighthouse.mjs` mide Lighthouse móvil sobre la vista previa local en 4179.
