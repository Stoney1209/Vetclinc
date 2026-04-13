Space para componentes IA reutilizables

Propósito
- Centralizar, versionar y descubrir habilidades (skills) para ser usadas en proyectos diversos.
- Servir como repositorio de plantillas, ejemplos y convenciones para la construcción de agentes y herramientas.

Estructura recomendada
- .agents/skills/<skill-name>/SKILL.md -> Descripción, uso, ejemplos y metadatos
- .operators/ -> comandos de operación y orquestación (opcional)
- opencode/ -> reglas, guías y plantillas de codificación para los skills
- tools/ -> utilidades comunes (abstracciones de ejecución, sandboxing, logging)

Guía rápida
- Crear una carpeta por skill y un SKILL.md claro con: nombre, versión, entrada, dependencias, ejemplos de uso.
- Mantener versionado semántico cuando sea posible.
