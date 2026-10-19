# Dirección visual y movimiento

Referencias consultadas el 19 de octubre de 2026:

- [Lando Norris](https://landonorris.com/): identidad a pantalla completa, contraste de escala, composición por capas y transiciones que acompañan el recorrido.
- [Charles Leclerc](https://charlesleclerc.com/en/): apertura audiovisual, tipografía protagonista y navegación por capítulos.

La implementación usa estas ideas de composición con identidad, contenido y recursos propios. No incorpora código, fotografías ni videos de esos sitios.

La dirección actual es **Skull Signal**: negro, verde eléctrico y azul, con una escena secundaria roja y negra. La portada muestra arte propio animado, en lugar de capturas de productos como fondo. El detalle de generación está en [arte cyberpunk](cyberpunk-art.md).

Una presentación de marca de 1,35 segundos aparece una vez por sesión, se puede saltar y se omite con movimiento reducido, pausa o un enlace directo a un capítulo. El menú ocupa la pantalla completa, conserva el foco, cierra con Escape y permite navegar a las páginas reales del archivo. El selector de universos funciona con mouse y flechas del teclado; sin JavaScript todos sus contenidos quedan visibles. Las transiciones entre documentos usan la API nativa View Transitions cuando el navegador la admite, con navegación normal como alternativa.

La portada conserva el desplazamiento nativo. GSAP ScrollTrigger fija temporalmente la apertura y transforma sus capas internas mientras el capítulo del Atelier la cubre. La entrada del configurador cambia escala y rotación; la escena hotelera mueve el entorno y la interfaz a velocidades distintas. Las pantallas de Vigía se relevan con deslizamiento y fundido. Los controles siguen disponibles en móvil.

La pausa se comparte entre portada y pie y persiste durante la sesión. La preferencia del sistema de reducir movimiento desactiva las secuencias; el estado aparece en la portada. El video requiere que la sección esté visible y la pestaña activa. Si se bloquea la reproducción aparece un botón para iniciarla; si falla la carga queda la composición estática. El ahorro de datos requiere iniciar el video manualmente.

En la prueba local con Microsoft Edge 155.0.4283.62 el video VP9 se decodificó a 1280 × 800, avanzó su reproducción y el solapamiento funcionó sin errores JavaScript. Esto verifica esa instalación y no determina la configuración de movimiento o ahorro de recursos del navegador personal del visitante.

Las pruebas de `tests/cinema.spec.js` cubren reproducción real, pausa, persistencia, salida del área visible, fijación y solapamiento, enlaces de capítulos, movimiento reducido, error de carga y bloqueo de reproducción automática. `tests/cyber.spec.js` verifica entrada, menú modal, teclado, paneles, navegación real, contraste, alternativa sin JavaScript y pausa del video detrás del menú. El resto conserva temas, galería, visor 3D, navegación y privacidad del CV.

Con Edge instalado, `node scripts/review-edge.mjs` verifica cuatro tamaños y ambos temas, guarda capturas y un informe en `.qa/cinema/`. La variable opcional `REVIEW_URL` permite comprobar la publicación. Requiere la vista previa local en el puerto 4179 si no se indica otra URL.
