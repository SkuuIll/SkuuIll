# Identidad y apariencia

El nombre visible es **Spulp**; la cuenta y las URLs conservan `SkuuIll`. La landing muestra habilidades de diseño y desarrollo. Los trabajos anteriores tienen su propio archivo.

## Sistema visual

`shell.css` define tokens y navegación compartida; `landing.css` contiene el campo de señales, la secuencia, los experimentos y el proceso. `global.css` y `experience.css` mantienen los estilos de casos y archivo. Se retiraron las capas antiguas `cinema.css` y `cyber.css`.

Grafito `#080D13`, superficie `#101B25`, texto `#EDF5F7`, secundario `#A0B4BF`, menta `#4CE1C7` y azul de apoyo `#72A6FF`. El modo claro usa fondo `#F2F6F7` y acentos oscuros legibles. Manrope y Geist Mono se sirven localmente.

La primera entrada usa modo oscuro. El visitante puede guardar claro/oscuro en `localStorage`. El acento inicial es menta y permanece estable. El pie permite cambiar manualmente a azul o coral durante la sesión. Los identificadores internos `forest`, `blue` y `clay` conservan compatibilidad.

La navegación presenta experiencia, laboratorio, proceso, contacto y archivo. El menú modal ocupa la pantalla completa, contiene el foco y devuelve el foco al cerrarse. La portada nunca esconde el cursor nativo ni publica datos del CV.

## Verificación

Playwright y axe cubren temas, acentos, laboratorios, menú, formularios, archivo, casos, visor de prenda y alternativa sin JavaScript. `node scripts/review-edge.mjs` guarda capturas e informe de la instalación local de Edge en `.qa/spulp/`.
