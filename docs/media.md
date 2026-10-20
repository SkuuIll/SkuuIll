# Procedencia de los recursos visuales

Las imágenes del portafolio son archivos locales. Las capturas de Vigía usan sede, personas, habitaciones y órdenes de demostración mediante respuestas de API interceptadas localmente.

La landing Skull actual dibuja geometría propia con Canvas y SVG. Las máscaras y el video Skull Signal de esta tabla son recursos de la versión anterior y no se cargan en la portada actual.

| Recurso                                                                | Procedencia                                                                                                                     | Qué muestra                                                                                                                                                           |
| :--------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vigia-modules.webp`                                                   | Interfaz de Gestion-Hotelera del propietario.                                                                                   | Entrada a Seguridad, Personal, Hotel y Administración.                                                                                                                |
| `skull-cyber-hero.webp`                                                | Imagen original generada con la herramienta integrada de imágenes.                                                              | Máscara escultórica de identidad Skull en metal negro, verde eléctrico y azul; no es una captura ni un producto del catálogo.                                         |
| `skull-cyber-atelier.webp`                                             | Imagen original generada con la herramienta integrada de imágenes.                                                              | Atelier futurista rojo y negro con una prenda holográfica conceptual; fondo de navegación, no captura del configurador.                                               |
| `skull-signal.webm`, `skull-signal-poster.webp`                        | Motion design producido por `scripts/render-signal-film.mjs` a partir de `skull-cyber-hero.webp`.                               | VP9 de 12 segundos, 1280 × 800 a 24 fps, sin audio: cámara virtual, luz y partículas. El arte base se generó con IA; el video se animó y codificó localmente.         |
| `vigia-gps.webp`                                                       | Misma interfaz, supervisión GPS.                                                                                                | Posiciones de demostración sobre un mapa de OpenStreetMap.                                                                                                            |
| `vigia-personal.webp`                                                  | Misma interfaz, Personal.                                                                                                       | Jornada y asistencia de equipos de demostración.                                                                                                                      |
| `vigia-hotel.webp`                                                     | Misma interfaz, habitaciones.                                                                                                   | Habitaciones, estados y valores de demostración.                                                                                                                      |
| `vigia-admin.webp`                                                     | Misma interfaz, compras.                                                                                                        | Órdenes y proveedores de demostración.                                                                                                                                |
| `hotel-environment-3d.webp`                                            | Generada con la herramienta integrada de imágenes.                                                                              | Escena hotelera ilustrativa; el dispositivo se compone en HTML con la captura real de Vigía. No representa un cliente ni una instalación.                             |
| `skull-sculpture-3d.webp`                                              | Generada con la herramienta integrada de imágenes, con fondo transparente.                                                      | Escultura de identidad: cinta cerámica en forma de S. No es una captura de software.                                                                                  |
| `atelier-colors.webp`, `atelier-design.webp`, `atelier-placement.webp` | CPaul/custom-studio ejecutado localmente desde Studio Pro; API interceptada para usar el catálogo incorporado y sesión anónima. | Editor real con cambios de color, texto de demostración y ubicaciones. No se enviaron pedidos ni se consultaron clientes.                                             |
| `models/atelier-tshirt/`                                               | Modelo de prenda y dependencias del catálogo de CPaul, cpaul-tshirt-basic; exportación glTF de CLO.                             | Muestra limitada del modelo con material uniforme, giro y zoom. No sustituye el configurador completo ni acredita autoría de la herramienta CLO.                      |
| `tactical-map.webp`                                                    | PUBG-Mortar-Tactical-Map ejecutado localmente.                                                                                  | Mapa del videojuego y herramientas de la aplicación. PUBG y sus recursos pertenecen a sus titulares.                                                                  |
| `pipa-web.webp`                                                        | Portada pública de pipaa.store, vinculada a Pipa_arg.                                                                           | Presentación de PIPAA y Panza Army. Las personas de la campaña no representan a Skull.                                                                                |
| `fluxnet-android-4.9.6.png`                                            | Recurso archivado en FluxNet/master/panel/public/images/mockups/fluxnet-4.9.6-inicio-lite.png.                                  | Interfaz Android 4.9.6 en modo Lite, sin perfil ni servidor activo. Se identifica la versión; no acredita una conexión VPN ni la validación del cliente nativo nuevo. |
| `cpaul-campaign.webp`, `cpaul-craft.webp`                              | Recursos de cpaul-landing/assets/images del propietario.                                                                        | Campaña de indumentaria e identidad de CPAUL; son material visual del proyecto, no capturas del Atelier 3D ni fotografías de Skull.                                   |
| `profile-cover-2026.svg`, `social-cover.png`                           | Generados por scripts/build-branding.mjs.                                                                                       | Identidad del perfil y vista previa social.                                                                                                                           |

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

La siguiente secuencia corresponde al diseño histórico y no se descarga en la landing actual. Para regenerar la secuencia de fondo, establecer `FFMPEG_PATH` con la ruta de un ejecutable local de FFmpeg que incluya el codificador VP9 y ejecutar `node scripts/render-signal-film.mjs`. El navegador de Playwright compone los fotogramas; FFmpeg los codifica sin audio. El video se sirve localmente, se pausa fuera de pantalla, detrás del menú y al ocultar la pestaña. Con movimiento reducido, pausa persistida o ahorro de datos no se descarga automáticamente; sin JavaScript queda el póster.

Los prompts y archivos del nuevo arte están en [Skull Signal](cyberpunk-art.md).

## Observatorio espacial

`public/media/spatial-observatory.webp` fue generado con la herramienta integrada de imágenes el 20 de octubre de 2026 y optimizado con Sharp a 1536 × 1024, calidad 86 (240606 bytes). Es una ilustración conceptual propia de la landing, sin relación con proyectos o clientes. El original PNG se conserva localmente fuera del repositorio.

Prompt: “Original wide cinematic landscape for Skull’s creative coding portfolio. Futuristic brutalist observatory inside a vast dark cavern, obsidian foreground structures, floating glass rings and a luminous mint/icy-blue sphere, distant geometric mountains and fog. Strong foreground/midground/background separation, centered vanishing point, dark negative space, polished cinematic 3D render. Charcoal, petrol blue, mint lights and chrome. No text, logos, people or skulls.”

El shader añade un campo de profundidad artístico aproximado, sin afirmar que la ilustración haya sido reconstruida en 3D. El túnel Umbral es geometría procedural original y no un video generado.
