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

La portada es una demostración de diseño e interacción: campo procedural, relato de scroll, laboratorio y proceso. El archivo conserva sus 21 casos. Atelier 3D permanece en `/proyectos/cpaul/` y Vigía en `/proyectos/vigia/`.

La escena proyecta geometría tridimensional con Canvas 2D, sin imágenes ni video descargados. Una alternativa SVG permanece si faltan scripts o contexto gráfico. El visor de prenda usa Three.js bajo demanda exclusivamente en su caso; cerrar la vista libera sus recursos.

El tema inicial es oscuro y recuerda la elección clara u oscura. El acento inicial menta es estable entre visitas; azul y coral son opciones manuales. Movimiento automático respeta el sistema y ahorro de datos; completo requiere elección explícita; reducido y pausa desactivan el bucle decorativo. Ver [movimiento](motion.md) y [apariencia](appearance.md).

src/data/projects.json conserva los casos y projects.ts define su presentación. /site/ redirige las URLs anteriores. El correo funciona sin scripts y el formulario prepara un borrador que el visitante decide enviar.

Después de publicar comprobar páginas, medios, rutas antiguas, retiro de documentos y errores de navegador. Ver [procedencia de medios](media.md) y [mantenimiento del perfil](profile.md).
