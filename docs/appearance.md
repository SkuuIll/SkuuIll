# Identidad y apariencia

El nombre visible es **Skull**; la cuenta y las URLs conservan `SkuuIll`. La landing muestra habilidades de diseño y desarrollo. Los trabajos anteriores tienen su propio archivo.

## Sistema visual

`shell.css` define tokens y navegación compartida; `landing.css` contiene el campo de señales, la secuencia, los experimentos y el proceso. `global.css` y `experience.css` mantienen los estilos de casos y archivo. Se retiraron las capas antiguas `cinema.css` y `cyber.css`.

Grafito `#080D13`, superficie `#101B25`, texto `#EDF5F7`, secundario `#A0B4BF`, menta `#4CE1C7` y azul de apoyo `#72A6FF`. El modo claro usa fondo `#F2F6F7` y acentos oscuros legibles. Manrope y Geist Mono se sirven localmente.

La primera entrada usa modo oscuro. El visitante puede guardar claro/oscuro en `localStorage`. Cada carga elige una de seis paletas: menta, azul, coral, violeta, ámbar e hielo. La selección excluye la anterior guardada; cambia también el fondo y conserva el tema claro/oscuro elegido. Si el almacenamiento está bloqueado se elige una variante aleatoria sin poder garantizar la exclusión entre cargas. El botón del pie permite cambiar manualmente de acento.

La navegación presenta experiencia, laboratorio, proceso, contacto y archivo. El menú modal ocupa la pantalla completa, contiene el foco y devuelve el foco al cerrarse. La portada nunca esconde el cursor nativo ni publica datos del CV.

## Verificación

Playwright y axe cubren temas, acentos, laboratorios, menú, formularios, archivo, casos, visor de prenda y alternativa sin JavaScript. `node scripts/review-edge.mjs` guarda capturas e informe de la instalación local de Edge en `.qa/spulp/`.

La cabecera usa una cápsula translúcida inspirada en materiales de Apple: blur limitado a 18 px, borde tenue, enlaces simples y dos controles de icono. Tiene fondo opaco si falta backdrop-filter. El selector Acabado permite Vidrio (inicial), Sólido y Del sistema; este último respeta reducir transparencia. Contraste aumentado y colores forzados usan la alternativa sólida. La apariencia es una interpretación web, no el material nativo de iOS.


## Materiales y variaciones

La cabecera, los controles y el laboratorio usan superficies translúcidas con borde iluminado y reflejos. La lente de la portada refracta el campo mediante un filtro SVG local cuando el navegador lo admite; blur y reflejos CSS son su alternativa. Se desvanece al entrar al relato para conservar la lectura. El fondo combina cinco formas y una semilla de orientación: esfera, cinta, hélice, toroide y retícula.

Las fuentes de diseño utilizadas son [Apple Design de Emil Kowalski](https://github.com/emilkowalski/skills/tree/main/skills/apple-design), [Frontend Design de Anthropic](https://github.com/anthropics/skills/tree/main/skills/frontend-design) y [Web Design Guidelines de Vercel](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines). Son herramientas del entorno de desarrollo; el sitio publicado no descarga ni ejecuta sus instaladores.
