Context7 MCP Auto-Rule (Global)
Description: Always use Context7 MCP automáticamente para documentación de librerías/APIs, generación de código y configuraciones. No se requiere instrucción explícita del usuario.
Activation: Global; aplica a todas las tareas de agentes que tocan docs/código/configuración, a menos que el usuario lo desactive.
Workflow:
- Resolver la library ID via resolver-library-id usando la librería y la consulta del usuario.
- Elegir la mejor coincidencia (preferir exacta; si hay versión, priorizar ID con versión).
- Consultar la documentación con query-docs usando el libraryId elegido y la pregunta del usuario.
- Utilizar la documentación obtenida en la respuesta, citando la versión y mostrando snippets oficiales cuando corresponda.
- Si hay múltiples fuentes, priorizar fuentes oficiales/autoritativas. Si no hay docs, proporcionar fallback con buenas prácticas.
- Verificar la salida con un prompt de prueba rápido para asegurar que aparece código y citación de versión.
Output: Incluir citación de versión y snippets del doc oficial cuando estén disponibles.
Notes: Mejora precisión y reproducibilidad; evita alucinaciones.
