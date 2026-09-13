# Landing de servicios y contrataciones

La futura web está en `site/`. Es HTML, CSS y JavaScript sin framework, fuentes externas, analítica ni dependencias de ejecución. No se publicó ni se modificó ningún dominio.

## Verla localmente

Desde la raíz del repositorio:

```bash
cd site
python3 -m http.server 8000
```

Abrí <http://localhost:8000>. También podés abrir `site/index.html` directamente; la copia al portapapeles depende de los permisos del navegador, con selección manual como alternativa.

## Contenido y diseño

- Presentación, proyectos reales enlazados, servicios, proceso de trabajo y preguntas frecuentes.
- Diseño adaptable a celulares, foco visible, navegación con teclado y respeto por movimiento reducido.
- Las portadas de proyectos son composiciones gráficas, no capturas ni resultados atribuidos a clientes.
- Metadatos básicos de título, descripción y vista previa social. Al decidir el dominio, agregá la URL canónica, `og:url` y una imagen social con URL absoluta.

Editá textos, servicios y tarjetas en `site/index.html`; los colores, tamaños y puntos de adaptación están en `site/assets/styles.css`.

Los proyectos se seleccionaron de los repositorios públicos y privados de SkuuIll. Se revisaron los README y la estructura de los seis repositorios privados: FluxNet, CPaul, BattleFX, VidAutonomo, Web-Catalogo y BotCheck. Sus fichas muestran un resumen funcional, las tecnologías documentadas y un botón para consultar. Están marcados como código privado, sin enlaces de acceso público al repositorio ni datos internos de despliegue. No se inventaron clientes, testimonios, precios, resultados ni cifras de experiencia. El email se conserva del README anterior: `skuuill@gmail.com`.

## Cómo funciona la consulta

1. El visitante elige un servicio y completa nombre, email e idea.
2. «Preparar consulta» valida el formulario y muestra el mensaje completo.
3. El visitante puede abrir su aplicación de correo, copiar el mensaje o descargarlo como `.txt`.
4. El envío ocurre cuando el visitante lo hace en su correo. La landing no tiene servidor de correo, base de datos ni almacenamiento local de consultas.

Los botones de cada proyecto completan el servicio y la referencia. Un enlace como `https://tu-dominio.com/?proyecto=Mi%20tienda#contacto` también completa la referencia, sin insertar HTML.

Si el visitante cambia datos después de preparar la consulta, la vista previa se oculta hasta volver a generarla. Así se evita usar un mensaje desactualizado.

El formulario facilita el primer contacto: **no firma contratos, no confirma una contratación y no realiza cobros**. Alcance, entregables, presupuesto y condiciones se acuerdan después. Para recibir consultas directamente desde la web se necesitará integrar un backend o proveedor de formularios y definir el tratamiento de esos datos.

Para cambiar el correo, actualizá `site/index.html`, la constante `recipient` en `site/assets/app.js` y los perfiles actuales en `README.md` y `translations/README.en.md`.

## Firma para cada proyecto

Al final de la landing, abrí «Crear firma para un proyecto»:

1. Indicá el nombre del proyecto.
2. Escribí la URL pública definitiva de la landing. La dirección local de vista previa no sirve para compartir.
3. Generá y copiá el HTML.
4. Pegalo en el pie de página del proyecto correspondiente.

La firma dice «Desarrollado por SkuuIll ↗». Su enlace abre el contacto e incluye el nombre del proyecto como referencia. El generador acepta HTTP/HTTPS, escapa el atributo HTML y rechaza direcciones locales comunes. No modifica otros repositorios automáticamente.

## Preparar la futura publicación

La carpeta que se publica es **`site/`**, sin proceso de compilación. Podés usar cualquier alojamiento estático o GitHub Pages:

1. Cuando decidas publicarla, subí los cambios al repositorio.
2. En GitHub, configurá Pages para publicar desde GitHub Actions.
3. Creá un flujo de publicación que cargue únicamente `site/` como artefacto de Pages y use el entorno `github-pages`.
4. Una vez comprobada la URL pública, actualizá el enlace de contratación en ambos README y generá las firmas con esa dirección.
5. Si usás dominio propio, configurá el dominio y DNS en el alojamiento elegido.

Las herramientas de desarrollo fijan `smol-toml` en la versión 1.8.0 mediante `overrides` para evitar una dependencia vulnerable del linter. Esta dependencia no se carga en la web.

No se agregó un flujo automático de despliegue: esta es una landing para una futura web. Las acciones existentes de métricas y animaciones del perfil se mantienen.

## Validación

Desde la raíz del repositorio, con Node.js 22 o posterior:

```bash
npm ci
npx playwright install chromium
npm run lint
npm test
```

Las pruebas levantan un servidor local en el puerto 4179. Comprueban navegación y recursos, ausencia de desbordamiento horizontal, formulario, referencias desde proyectos, descarga, copia alternativa, escape de la firma y funcionamiento en una subcarpeta como las de GitHub Pages. No envían emails.

## Cambios en el perfil

El README principal ahora está en español con una versión actual en inglés. El antiguo enlace al portfolio no se presenta como una web disponible: no resolvió durante la revisión. Las traducciones anteriores se conservaron con aviso de archivo; `translations/README.es.md` dirige al perfil actual.

Se retiraron porcentajes y contadores manuales, insignias sociales sin verificar y contenido decorativo dependiente de múltiples servicios externos. Las métricas generadas por Actions se mantienen con una aclaración sobre su actualización.


## Animaciones del README

La cabecera `assets/profile-banner.svg` tiene una entrada de texto, un monograma flotante y un trazo orbital. `assets/profile-terminal.svg` agrega una línea con efecto de escritura. Son SVG locales sin JavaScript ni servicios externos: terminan en cuatro segundos. Cada imagen tiene una alternativa `-static.svg`, seleccionada mediante `<picture>` cuando se solicita `prefers-reduced-motion`, además de una regla CSS dentro del SVG. Al editar un SVG animado, actualizá su alternativa estática con el mismo contenido y sin el bloque `<style>`. Si el visor no reproduce animaciones, conservan el contenido estático.

La animación de contribuciones se muestra dentro de una sección desplegable en ambos README. Utiliza los SVG reales de la rama `output`, generados por el workflow existente `snake.yml`. Abrir o cerrar la sección permite mostrarla u ocultarla. No representa actividad de los repositorios privados.
