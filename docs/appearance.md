# Identidad, ambientes y Vigía

El nombre visible es **School**. La cuenta y los enlaces de GitHub conservan el identificador `SkuuIll`.

## Perfil de GitHub

Los README en español e inglés incluyen el caso Vigía, con hotelería, GPS, rondas, personal, operación y licencias. Los enlaces públicos apuntan al repositorio de distribución; el código y los datos operativos siguen privados.

Los SVG usan un fondo multicolor y animaciones breves. El movimiento termina a los cuatro segundos y se desactiva con `prefers-reduced-motion`. GitHub no ejecuta el JavaScript del repositorio dentro del README, por lo que la selección de ambientes corresponde a la web en `site/`.

## Web del portafolio

`site/assets/palette.js` selecciona uno de cinco ambientes: Lima, Océano, Aurora, Coral y Ámbar. Se carga antes del CSS para aplicar el color inicial.

- Se guarda únicamente el índice de la última paleta en `localStorage`.
- La siguiente visita elige una paleta diferente a la anterior cuando ese almacenamiento está disponible.
- Si el navegador bloquea el almacenamiento, el sitio sigue funcionando y selecciona una paleta al azar.
- Volver desde la caché de navegación también cambia el ambiente.
- El botón **Cambiar ambiente** permite elegir otra combinación sin recargar.
- **Pausar animaciones** detiene el movimiento decorativo y evita el efecto de inclinación.
- La preferencia de movimiento reducido del sistema se respeta siempre.

La ilustración de GPS es decorativa: no contiene ubicaciones, recorridos ni información de personas reales. El formulario permite consultar por hotelería/GPS, Android/escritorio y Linux/automatización. Prepara un borrador local para enviar desde el correo del visitante.

## Verificación

La suite `tests/landing.spec.js` comprueba navegación responsive, formularios, accesibilidad, cambios de paleta, pausa de animaciones y funcionamiento con almacenamiento bloqueado. Las cinco paletas se revisan con la regla de contraste de axe.
