# Integraciones, alcance y protección de la cuenta

## LinkedIn
El conector LinkedIn disponible en ChatGPT en esta sesión solo permite buscar profesionales. No expone edición de perfil, acceso al inbox ni publicación.

Los permisos oficiales de LinkedIn para publicar dependen del producto y autorización de la app. `w_member_social` corresponde a publicar como usuario autenticado cuando la integración está aprobada para usarlo. No implica permisos para cambiar nombre, experiencia o banner.

## Metricool (opcional)
Integración de planificación de redes sociales que puede ofrecer gestión de publicaciones. Requiere que el usuario conecte su cuenta de Metricool y la cuenta de LinkedIn correspondiente. Las funciones accesibles dependen de la plataforma y su autorización. No se presupone que esté conectada.

## Reglas de operación
- No pedir contraseñas, cookies o códigos de verificación por chat.
- No scrapear ni automatizar navegación de LinkedIn en contra de sus condiciones.
- Ningún DM, invitación, comentario o publicación masiva sin validación específica.
- Ningún texto con certificaciones, métricas o resultados no comprobados.
- Un estado `approved` en CSV no significa que algo se haya publicado.
- Solo marcar `published` después de recibir URL o ID confirmado por la plataforma.
- No alojar tokens de API ni datos de conversaciones privadas en este repositorio público.

Documentación de API oficial:
https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
