# LinkedIn Agent — Skull Edition

Biblioteca operativa para mantener una presencia profesional en LinkedIn con revisión humana.

## Estado

- **Implementado:** los 11 workflows originales, conservados en `upstream/skills/`, más configuración personal, plan editorial y borradores.
- **Sin configurar:** conexión OAuth o servicio externo de publicación; ninguna modificación fue realizada en LinkedIn.
- **Sin consumo de GitHub Actions:** todo son documentos, scripts Python locales y gestión de borradores.
- **Seguridad:** el agente redacta y planifica. Publicar, comentar, editar el perfil o enviar mensajes requieren una conexión autorizada y revisión expresa.

## Cómo usarlo con ChatGPT

Este repositorio **no instala skills nativas dentro de ChatGPT**. Es una biblioteca de instrucciones portable:
1. Abrí `SKULL_AGENT.md` y el módulo `upstream/skills/li-*/SKILL.md` correspondiente.
2. Compartí esos archivos en ChatGPT o pedile al asistente que los lea desde GitHub conectado.
3. Dado un tema real o material verificable, pedí: «Usá li-post con la voz de profile/voice.md» o «Usá li-plan».
4. Revisá el texto final antes de llevarlo a LinkedIn. Los originales apuntan a Claude y rutas `~/.claude`; el orquestador de esta edición mapea las instrucciones a las rutas de este proyecto.

## Módulos

`li-post`, `li-comment`, `li-reply`, `li-profile`, `li-plan`, `li-human`, `li-carousel`, `li-repurpose`, `li-dm`, `li-inbox` y `li-audit`.

## Contenido de esta edición

- `SKULL_AGENT.md`: orquestador y reglas.
- `profile/voice.md`: tono base provisional, no una voz inferida de publicaciones previas.
- `profile/profile-draft.md`: titular, Acerca de, experiencia y destacados para revisión.
- `content/2026-11-02-plan.md`: agenda editorial inicial.
- `content/drafts/`: tres publicaciones en español listas para revisar.
- `content/queue.csv`: cola editorial. El estado inicial es `draft`.
- `docs/INTEGRATIONS.md`: alcance real de LinkedIn, Metricool y permisos.

## Atribución y licencia

Contiene una copia de los archivos de `Jakeschincariol/linkedin-agent-skill`, autor Jake Schincariol, licencia MIT. Se conserva el aviso original en `upstream/LICENSE`. Fuente: https://github.com/Jakeschincariol/linkedin-agent-skill

La edición Skull agrega instrucciones y borradores originales sin reemplazar la lógica del repositorio fuente. Los scripts de `li-human` están orientados principalmente al inglés; **sus puntuaciones no son fiables para español** y no certifican detección de IA.

No se prometen alcance, clientes, tasas de interacción ni publicaciones automáticas.
