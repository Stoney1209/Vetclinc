Este espacio contiene habilidades (skills) para automatizar tareas de desarrollo, revisión de código, documentación y pruebas.

Estructura clave:
- .agents/skills/: contiene cada skill con su SKILL.md y código asociado
- opencode/: reglas y guías para las skills y su ejecución
- tools/: utilidades y helper scripts para orquestación

Cómo usar:
- Define un skill con una interface clara (input/output)
- Registra el skill en un index o manifest si se implementa un loader dinámico
- Añade tests unitarios para cada skill
