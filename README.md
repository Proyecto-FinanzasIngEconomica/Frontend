# CrediFlow · Frontend

React + Vite y JavaScript. Acceso y registro responsive con selección de vendedor o cliente. Identidad pendiente de integración real con el backend.

## Desarrollo

Requiere Node.js 22.12 o posterior.

```sh
npm ci
cp .env.example .env
npm run dev
```

En PowerShell: `Copy-Item .env.example .env`.

```sh
npm test
npm run build
```

## Arquitectura

Los contextos se organizan por funcionalidad (primero `identity`).

- `domain`: reglas y contrato del repositorio; sin React ni HTTP.
- `application`: casos de uso que reciben dependencias por inyección.
- `infrastructure`: adaptadores HTTP y configuración de integración.
- `presentation`: componentes React, estado del formulario y estilos de interacción.
- `shared`: componentes visuales y cliente HTTP transversal.
- `app`: composición de dependencias y configuración.

Las dependencias apuntan hacia domain/application. No se agregan entidades de tiendas ni cálculos financieros al contexto de identidad. Los cálculos oficiales pertenecen al backend.

## Gitflow

- `main`: base estable y entregas aprobadas.
- `develop`: integración de avances revisados.
- `feature/<avance>`: cada avance parte de `develop` y se revisa antes de integrar.
- `release/<version>` y `hotfix/<correccion>` cuando sean necesarios.

Ejemplo: `feature/01-access-screen`. No integrar automáticamente en main/develop: usar revisión y PR.

Consulta [el contrato de integración](docs/backend-integration.md) antes de habilitar la API de identidad. La interfaz nunca se conecta directamente a MySQL/PostgreSQL ni guarda contraseñas o tokens en almacenamiento web.
