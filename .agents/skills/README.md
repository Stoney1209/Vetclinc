Guía para crear skills en el repositorio IA

- Estructura de un skill:
  - SKILL.md: descripción, API/entrada, salida esperada, ejemplos
  - index.ts: punto de ejecución del skill
  - package.json (opcional): dependencias del skill
- Contenido mínimo de SKILL.md:
  - Nombre
  - Descripción corta
  - Entradas/formatos de salida
  - Ejemplos de uso
- Versionado: usa SemVer para cada skill
- Tests: incluye unit tests para validar comportamiento
