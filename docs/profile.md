# Mantenimiento del perfil

El perfil principal está en `README.md`; su versión inglesa en `translations/README.en.md`. Ambos presentan el mismo alcance y enlazan al portafolio, el CV y el correo.

## Estructura editorial

1. Identidad de Skull y propuesta profesional breve.
2. Cuatro trabajos seleccionados: Vigía, comercio e indumentaria 3D, Tactical Map y Repo Setup Kit.
3. Caso Vigía con sus cuatro áreas y una captura real de demostración.
4. Capacidades agrupadas por aplicación práctica.
5. Otros proyectos, atribuciones y contacto.
6. Actividad de GitHub y detalles de mantenimiento en secciones desplegables.

La identidad principal es Skull; el usuario es SkuuIll. El CV utiliza Facundo Nahuel Escobedo. La formación secundaria se presenta como Técnico Electromecánico. El profesorado de TIC se indica como estudios incompletos, con inicio en 2019, sin atribuir un título obtenido.

## Recursos

La cabecera actual es `assets/profile-cover-2026.svg`. Se regenera, junto con la imagen social, mediante:

```bash
npm run branding
```

Las capturas del perfil apuntan a `public/media/`. Las piezas SVG anteriores se conservan como recursos históricos; el generador Python anterior no produce la cabecera nueva.

## Criterios para editar

- Actualizar español e inglés juntos.
- Mantener nombres, fechas, alcance y contacto coherentes con la web y el CV.
- No agregar cifras de clientes, mejoras de rendimiento, experiencia o certificaciones sin respaldo.
- Identificar forks y preservar la atribución y licencia originales.
- Presentar los prototipos y productos en desarrollo con su estado real.
- Usar datos de demostración en capturas de productos privados.
- Verificar enlaces públicos antes de presentarlos como demos disponibles.
- Ejecutar `npm run lint`; si cambia el CV, regenerar y revisar sus exportaciones.

La actividad de GitHub representa código alojado en repositorios, no toda la experiencia profesional. La animación de contribuciones y las métricas se mantienen como información secundaria.

[Desarrollo y publicación del portafolio](landing.md) · [Procedencia de medios](media.md)

## Repositorios para fijar en el perfil

Selección propuesta: SkuuIll (presentación y portafolio), PUBG-Mortar-Tactical-Map (aplicación visual), Repo-Setup-Kit (automatización), Project-Final-Informatorio-25 (Django), WebBanderasPUBG (herramienta web) y Vigia-Hotel-Descargas (distribución del producto). El repositorio de descargas permite acceder al producto; no representa código fuente público de Vigía. Los repositorios privados conservan su visibilidad.
