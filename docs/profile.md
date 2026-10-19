# Mantenimiento del perfil

El perfil principal está en `README.md` y su versión en inglés en `translations/README.en.md`.

## Estructura editorial

1. Identidad y presentación: desarrollo de software Full Stack y multiplataforma.
2. Especialidades: web, Android, escritorio, backend, Linux y automatización.
3. Tecnologías agrupadas por uso.
4. Caso destacado de Vigía y tres casos públicos con propósito, funcionalidades, tecnologías y acceso a su distribución o repositorio.
5. Otros repositorios, con atribución explícita para forks.
6. Productos privados: únicamente descripciones ya compartidas públicamente.
7. Propuesta de colaboración y contacto.
8. Actividad y detalles del repositorio en secciones desplegables.

## Recursos visuales

Los archivos `assets/profile-cover-*.svg` y `assets/project-*.svg` son vectores locales: no dependen de un generador de banners externo. Usan fondo oscuro, acento verde y tipografía del sistema. No contienen scripts ni fuentes remotas. Usan animaciones breves que respetan la preferencia de movimiento reducido; la web incorpora ambientes de color y un control para pausar el movimiento.

Las piezas de proyectos son ilustraciones de identidad, no capturas de sus interfaces. Los títulos, funcionalidades y enlaces también están presentes como texto en Markdown para no depender de la lectura de una imagen.

Para regenerar los SVG desde la raíz del repositorio:

```bash
python3 scripts/build_profile_visuals.py
```

## Actualizaciones

- Actualizar español e inglés juntos.
- Mantener rutas de recursos relativas a cada README.
- Describir funcionalidades concretas; no agregar cifras de clientes, rendimiento, años de experiencia o certificaciones sin respaldo.
- Identificar los forks y preservar el crédito al proyecto original.
- No incorporar código, URLs internas, credenciales ni información de clientes privados.
- Agregar una demo pública solo cuando se haya confirmado su dirección.
- Revisar el resultado de **README Quality** después de publicar cambios.

La web en `site/` tiene su propia documentación en [landing.md](./landing.md).
