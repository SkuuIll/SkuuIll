# Procedencia de los recursos visuales

Las imágenes del portafolio son archivos locales. Las capturas de Vigía usan sede, personas, habitaciones y órdenes de demostración mediante respuestas de API interceptadas localmente.

| Recurso | Procedencia | Qué muestra |
| :--- | :--- | :--- |
| `vigia-modules.webp` | Interfaz de Gestion-Hotelera del propietario. | Entrada a Seguridad, Personal, Hotel y Administración. |
| `vigia-gps.webp` | Misma interfaz, supervisión GPS. | Posiciones de demostración sobre un mapa de OpenStreetMap. |
| `vigia-personal.webp` | Misma interfaz, Personal. | Jornada y asistencia de equipos de demostración. |
| `vigia-hotel.webp` | Misma interfaz, habitaciones. | Habitaciones, estados y valores de demostración. |
| `vigia-admin.webp` | Misma interfaz, compras. | Órdenes y proveedores de demostración. |
| `tactical-map.webp` | PUBG-Mortar-Tactical-Map ejecutado localmente. | Mapa del videojuego y herramientas de la aplicación. PUBG y sus recursos pertenecen a sus titulares. |
| `pipa-web.webp` | Portada pública de pipaa.store, vinculada a Pipa_arg. | Presentación de PIPAA y Panza Army. Las personas de la campaña no representan a Skull. |
| `cpaul-campaign.webp`, `cpaul-craft.webp` | Recursos de cpaul-landing/assets/images del propietario. | Campaña de indumentaria e identidad de CPAUL; son material visual del proyecto, no capturas del Atelier 3D ni fotografías de Skull. |
| `profile-cover-2026.svg`, `social-cover.png` | Generados por scripts/build-branding.mjs. | Identidad del perfil y vista previa social. |

Las composiciones de Repo Setup Kit y FluxNet son gráficos de identidad, identificados como tales. La terminal presenta el comando; no acredita una ejecución en producción.

Las capturas documentan interfaces del código consultado. Los datos de demostración no certifican integración con un servidor productivo ni la validación completa de todos sus flujos.

El mapa de supervisión contiene datos de [OpenStreetMap contributors](https://www.openstreetmap.org/copyright). El portafolio conserva esa atribución.

Manrope y Geist Mono se sirven localmente desde Fontsource, bajo las licencias incluidas en sus paquetes. El sitio no solicita fuentes a Google Fonts.

[Licencia de Manrope](../public/licenses/Manrope-OFL.txt) · [Licencia de Geist Mono](../public/licenses/Geist-Mono-OFL.txt)

Para regenerar la identidad y la vista previa social:

```bash
npm run branding
```

Las capturas de proyectos se actualizan por separado, desde entornos de demostración. Revisar datos visibles y atribuciones antes de reemplazarlas.
