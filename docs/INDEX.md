# 📚 Centro de Documentación: VetClinic Pro

Bienvenido a la documentación técnica oficial de **VetClinic Pro**. Esta guía está diseñada para desarrolladores, administradores de sistemas y personal técnico.

## 🗺️ Guías Principales

| Documento | Descripción |
|---|---|
| [🏗️ Arquitectura](./architecture.md) | Visión general del sistema, stack tecnológico y flujo de datos. |
| [📊 Base de Datos](./database.md) | Diagrama ER, descripción de modelos y estrategias de persistencia. |
| [🌐 Referencia de API](./API.md) | Documentación detallada de todos los endpoints REST y WebSockets. |
| [🎨 Frontend & UI](./frontend.md) | Estructura de Next.js, sistema de diseño y gestión de estado. |
| [🚀 Despliegue](./deployment.md) | Guía de configuración, variables de entorno y pasos para producción. |
| [🧪 Testing](./testing.md) | Estrategia de pruebas, herramientas y estándares de calidad. |
| [✨ Sistema de Diseño](./design.md) | Especificación visual "The Clinical Curator". |

---

## 🛠️ Desarrollo Rápido

Si acabas de clonar el repositorio, sigue estos pasos:

1.  **Instalar**: `pnpm install`
2.  **Configurar**: Copia `apps/api/.env.example` a `apps/api/.env` y configura tu DB.
3.  **Preparar DB**: `pnpm db:push && pnpm db:seed`
4.  **Iniciar**: `pnpm dev`

## 👥 Roles y Permisos

El sistema implementa RBAC (Role-Based Access Control) con los siguientes niveles:

- **ADMIN**: Control total, gestión de usuarios y reportes financieros.
- **VETERINARIAN**: Gestión clínica, expedientes, prescripciones y citas.
- **RECEPTIONIST**: Gestión de clientes, mascotas, agenda y ventas.
- **INVENTORY_MANAGER**: Control de stock, productos y proveedores.

---

*Para soporte técnico o contribuciones, contacta al equipo de desarrollo.*
