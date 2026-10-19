# Portafolio de Skull

Sitio estático con Astro, TypeScript y GSAP. Fuentes en src/, recursos en public/ y salida en dist/. Pages publica únicamente dist/ mediante GitHub Actions, bajo /SkuuIll/.

## Desarrollo

Node 22.22 o posterior; CI usa Node 24.

```bash
npm ci
npx playwright install chromium
npm run dev
npm run lint
npm run build
npm run check:privacy
npm test
```

Playwright inicia build y preview en el puerto 4179 si no hay uno abierto. Si se reutiliza un preview, compilar antes de probar. Para capturas: npm run preview y npm run review:visual.

## Privacidad

El currículum se conserva fuera del repositorio público en el espacio local del propietario. No copiar documentos personales a public/ ni sus fuentes y formación personal a los datos del portafolio. La comprobación de privacidad revisa fuentes y build; el navegador comprueba que las antiguas descargas responden 404.

El retiro actual no elimina revisiones históricas ni copias descargadas. La auditoría de esa exposición se conserva en el espacio local de coordinación.

## Contenido y publicación

La portada prioriza Atelier 3D y el ecosistema Vigía, seguidos de un listado de aplicaciones realizadas y otro de servicios propuestos. El archivo conserva 21 casos. El tema claro/oscuro sigue inicialmente al sistema y recuerda la elección explícita en localStorage; las paletas de acento y la pausa se conservan por sesión.

La muestra de prenda usa Three.js y se importa al activarla. No descarga modelos antes de esa acción; renderiza al cambiar la cámara, el tamaño o un control, sin bucle permanente. Cerrar 3D libera geometrías, materiales, texturas y contexto. Si falla WebGL, se conserva la presentación estática. El visor reducido no incluye edición de bordados: las capturas muestran el editor completo.

GSAP añade entradas, profundidad de scroll y estados de galería. La cinta de texto y los efectos respetan movimiento reducido y pausa manual. La galería usa Web Animations API cuando se permite movimiento. No hay secuestro del scroll del navegador.

src/data/projects.json conserva los casos y projects.ts define su presentación. /site/ redirige las URLs anteriores. El correo funciona sin scripts y el formulario prepara un borrador que el visitante decide enviar.

Después de publicar comprobar páginas, medios, rutas antiguas, retiro de documentos y errores de navegador. Ver [procedencia de medios](media.md) y [mantenimiento del perfil](profile.md).
