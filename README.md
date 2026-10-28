# CrediFlow · Frontend

React + Vite y JavaScript. Acceso por correo y contraseña, registro de vendedor/cliente y dashboard responsive. Identidad local temporal para pruebas, reemplazable por el backend.

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

Consulta [el contrato de integración](docs/backend-integration.md) antes de habilitar la API de identidad. La interfaz nunca se conecta directamente a MySQL/PostgreSQL. El modo local guarda perfiles, contraseñas derivadas (hash y sal), sesión e historial únicamente en este navegador; usa datos de prueba. No guarda contraseñas originales.

## Probar el avance 06

1. Abre «Solicitar una cuenta», elige cliente o vendedor y registra datos de prueba con un correo único.
2. Inicia sesión con ese correo y contraseña. Se abrirá el dashboard de esa cuenta.
3. Recarga: la sesión se mantiene. Revisa «Mi actividad» desde el perfil o «Revisar mis accesos».
4. Pulsa «Cerrar sesión» y vuelve a entrar para comprobar las entradas y salidas.
5. Para ver tiendas, registra primero una cuenta de vendedor en este mismo navegador/origen. El catálogo de productos aún está vacío.

`VITE_IDENTITY_PROVIDER=local` selecciona el adaptador temporal. Cuentas y sesiones no se comparten entre navegadores. Cerrar la pestaña no cierra sesión. Elimina datos del sitio para reiniciar las pruebas; esto borra sus cuentas locales.
