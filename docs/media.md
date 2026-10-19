# Procedencia de los recursos visuales

Las imágenes del portafolio son archivos locales. Las capturas de Vigía usan sede, personas, habitaciones y órdenes de demostración mediante respuestas de API interceptadas localmente.

| Recurso | Procedencia | Qué muestra |
| :--- | :--- | :--- |
| `vigia-modules.webp` | Interfaz de Gestion-Hotelera del propietario. | Entrada a Seguridad, Personal, Hotel y Administración. |
| `product-film.webm`, `product-film-poster.webp` | Composición original de `atelier-colors.webp`, `vigia-hotel.webp` y `vigia-gps.webp`, producida por `scripts/render-product-film.mjs`. | Video decorativo VP9 de 12 segundos, 1280 × 800 a 24 fps, sin audio. Anima capturas mediante desplazamientos y fundidos; no es una grabación de interacción ni un video generado con IA. |
| `vigia-gps.webp` | Misma interfaz, supervisión GPS. | Posiciones de demostración sobre un mapa de OpenStreetMap. |
| `vigia-personal.webp` | Misma interfaz, Personal. | Jornada y asistencia de equipos de demostración. |
| `vigia-hotel.webp` | Misma interfaz, habitaciones. | Habitaciones, estados y valores de demostración. |
| `vigia-admin.webp` | Misma interfaz, compras. | Órdenes y proveedores de demostración. |
| `hotel-environment-3d.webp` | Generada con la herramienta integrada de imágenes. | Escena hotelera ilustrativa; el dispositivo se compone en HTML con la captura real de Vigía. No representa un cliente ni una instalación. |
| `skull-sculpture-3d.webp` | Generada con la herramienta integrada de imágenes, con fondo transparente. | Escultura de identidad: cinta cerámica en forma de S. No es una captura de software. |
| `atelier-colors.webp`, `atelier-design.webp`, `atelier-placement.webp` | CPaul/custom-studio ejecutado localmente desde Studio Pro; API interceptada para usar el catálogo incorporado y sesión anónima. | Editor real con cambios de color, texto de demostración y ubicaciones. No se enviaron pedidos ni se consultaron clientes. |
| `models/atelier-tshirt/` | Modelo de prenda y dependencias del catálogo de CPaul, cpaul-tshirt-basic; exportación glTF de CLO. | Muestra limitada del modelo con material uniforme, giro y zoom. No sustituye el configurador completo ni acredita autoría de la herramienta CLO. |
| `tactical-map.webp` | PUBG-Mortar-Tactical-Map ejecutado localmente. | Mapa del videojuego y herramientas de la aplicación. PUBG y sus recursos pertenecen a sus titulares. |
| `pipa-web.webp` | Portada pública de pipaa.store, vinculada a Pipa_arg. | Presentación de PIPAA y Panza Army. Las personas de la campaña no representan a Skull. |
| `fluxnet-android-4.9.6.png` | Recurso archivado en FluxNet/master/panel/public/images/mockups/fluxnet-4.9.6-inicio-lite.png. | Interfaz Android 4.9.6 en modo Lite, sin perfil ni servidor activo. Se identifica la versión; no acredita una conexión VPN ni la validación del cliente nativo nuevo. |
| `cpaul-campaign.webp`, `cpaul-craft.webp` | Recursos de cpaul-landing/assets/images del propietario. | Campaña de indumentaria e identidad de CPAUL; son material visual del proyecto, no capturas del Atelier 3D ni fotografías de Skull. |
| `profile-cover-2026.svg`, `social-cover.png` | Generados por scripts/build-branding.mjs. | Identidad del perfil y vista previa social. |

La composición de Repo Setup Kit es un gráfico de identidad. La terminal presenta el comando; no acredita una ejecución en producción. FluxNet muestra una captura archivada de su interfaz Android, identificada con su versión.

Las capturas documentan interfaces del código consultado. Los datos de demostración no certifican integración con un servidor productivo ni la validación completa de todos sus flujos.

Las ilustraciones generadas y sus prompts están documentados en [dirección de imágenes](image-prompts.md). Se optimizaron a WebP y se sirven desde el propio sitio. La escena de hotel y el recurso de identidad se mantienen separados de las capturas reales.

El mapa de supervisión contiene datos de [OpenStreetMap contributors](https://www.openstreetmap.org/copyright). El portafolio conserva esa atribución.

Manrope y Geist Mono se sirven localmente desde Fontsource, bajo las licencias incluidas en sus paquetes. El sitio no solicita fuentes a Google Fonts.

[Licencia de Manrope](../public/licenses/Manrope-OFL.txt) · [Licencia de Geist Mono](../public/licenses/Geist-Mono-OFL.txt)

La muestra 3D usa Three.js bajo su [licencia MIT](../public/licenses/Three-MIT.txt).

Para regenerar la identidad y la vista previa social:

```bash
npm run branding
```

Las capturas de proyectos se actualizan por separado, desde entornos de demostración. Revisar datos visibles y atribuciones antes de reemplazarlas.

Para regenerar la secuencia de fondo, establecer `FFMPEG_PATH` con la ruta de un ejecutable local de FFmpeg que incluya el codificador VP9 y ejecutar `node scripts/render-product-film.mjs`. El navegador de Playwright compone los fotogramas; FFmpeg los codifica sin audio. El video se sirve localmente, se pausa fuera de pantalla y al ocultar la pestaña. Con movimiento reducido, pausa persistida o ahorro de datos no se descarga automáticamente; sin JavaScript queda el póster.
