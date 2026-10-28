# Integración con el backend recibido

Revisión estática del archivo `backend-main.zip` facilitado el 28 de octubre de 2026. No se ejecutó el backend ni se verificó una base de datos activa. Esta revisión no modifica su código ni certifica su seguridad.

> Estado vigente (avance 06): el frontend usa identidad local temporal por solicitud del usuario. Los apartados de integración HTTP y avances previos describen contratos pendientes o decisiones históricas.

## Fuente real frente al informe

El código incluye Spring Boot 4.1.1, Java 25 y el conector MySQL. El PDF indicaba Spring Boot 3.5.8 y PostgreSQL. Para esta entrega se toma el código como referencia de contratos HTTP; debe confirmarse qué motor se mantendrá. El frontend no depende del motor de persistencia.

Solo hay controladores de productos, clientes y compras. No aparecen implementaciones de autenticación, usuarios, tiendas, listados de pago, pagos ni auditoría de operaciones. La auditoría JPA de entidades no equivale a una bitácora de acciones. No se encontró configuración CORS o Spring Security en las fuentes del ZIP.

## Rutas implementadas

Prefijo: `/api/v1/stores/{storeId}`. Los nombres de campos y enumeraciones del código están en inglés.

| Método     | Ruta relativa                                  | Uso                              |
| ---------- | ---------------------------------------------- | -------------------------------- |
| GET / POST | `/products`                                    | Listar / crear productos         |
| GET / PUT  | `/products/{productId}`                        | Consultar / actualizar           |
| PATCH      | `/products/{productId}/deactivate`             | Baja lógica                      |
| GET / POST | `/clients`                                     | Listar / crear clientes          |
| GET / PUT  | `/clients/{clientId}`                          | Consultar / actualizar           |
| PATCH      | `/clients/{clientId}/deactivate`               | Baja, rechazada si hay deuda     |
| POST / GET | `/clients/{clientId}/credit-conditions`        | Crear / historial de condiciones |
| GET        | `/clients/{clientId}/credit-conditions/active` | Condición vigente                |
| GET        | `/clients/{clientId}/credit-line`              | Cupo disponible                  |
| POST / GET | `/purchases`                                   | Registrar / listar compras       |
| GET        | `/purchases/{purchaseId}`                      | Compra con productos y cuotas    |

Swagger UI: `/swagger-ui.html`. OpenAPI JSON: `/v1/api-docs`.

Listas paginadas: `content` y `page` (`size`, `number`, `totalElements`, `totalPages`), mediante Spring `PagedModel`. Parámetros `page`, `size`, `sort`; productos/clientes admiten `status`; compras admiten `clientId`. Confirmar el JSON ejecutando la API antes de implementar los listados.

### Datos relevantes para próximas pantallas

- Producto: `name`, `description`, `supplier`, `brand`, `unitOfMeasure`, `imageUrl`, `cashPrice`, `creditPrice`, `currency`, `endOfMonthAllowed`, `installmentsAllowed`. La imagen se recibe por URL, sin subida de archivos.
- Cliente: `documentType`, `documentNumber`, `name`, `lastName`, `phone`, `email`, `address`. El DTO de actualización no permite cambiar el documento.
- Condición: `creditLimit`, `currency`, `compensatoryRate`, `lateRate`, `maxInstallmentMonths`, `cutoffDay`, `cutoffTime`, `paymentDay`.
- Tasa: `type` (`NOMINAL` / `EFFECTIVE`), `value` (0.24 equivale a 24 %), `period` y `capitalization`. Capitalización solo para nominal. Respetar los enums exactos del backend.
- Compra: `clientId`, `modality` (`END_OF_MONTH` / `INSTALLMENTS`), `installmentCount` (omitir para fin de mes), `purchasedAt` opcional e `items: [{productId, quantity}]`. No enviar precios, tasas o totales calculados por el navegador.
- Detalle de compra: incluye `items`, `installments`, `tea`, `lateTea`, `graceDays`, `itemsTotal`, `financedAmount`, `totalInterest`, `totalToPay`, fechas del ciclo y moneda.
- Línea: `currency`, `creditLimit`, `usedCredit`, `availableCredit`.
- Estados de productos/clientes: `ACTIVE` / `INACTIVE`; no reutilizar directamente los nombres españoles del PDF.
- Errores: `{ "message": "..." }`. El handler usa 400 para formato/argumentos, 404 para ausencia y **420** para reglas de negocio (no 422). Conviene acordar 422 en una revisión del backend; el cliente HTTP trata ambos como fallos.

## Acceso: contrato propuesto, todavía NO existente

Se eligió **username** para mantener consistencia con el modelo de usuarios del informe. La interfaz de registro público se añadió por solicitud del usuario. Aún no tiene API. La recuperación de contraseña sigue siendo una ayuda para contactar al administrador. Ningún formulario simula envíos exitosos.

Propuesta a acordar:

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "username": "juan.perez", "password": "..." }
```

```json
{
  "user": { "id": 1, "username": "juan.perez", "role": "ADMIN_TIENDA", "storeId": 2 }
}
```

Roles propuestos: `ADMIN_SISTEMA`, `ADMIN_TIENDA`, `CLIENTE`; `storeId` obligatorio salvo para administrador del sistema. La sesión de esta primera pantalla solo se conserva en memoria y muestra confirmación; no hay dashboard implementado.

Propuesta de sesión: cookie `HttpOnly`, `Secure` en producción y política `SameSite` acorde al despliegue. El cliente usa `credentials: include`. El backend deberá definir CSRF, cierre de sesión, expiración y recuperación de sesión. Si se decide JWT en cabecera, cambiar el adaptador y acordar renovación; no guardar tokens ni contraseñas en localStorage/sessionStorage. No hay opción «Recordar sesión» hasta definir ese contrato.

Para habilitar: implementar y verificar el contrato, configurar `VITE_API_BASE_URL` y cambiar `VITE_AUTH_ENABLED=true`. La ruta se configura con `VITE_AUTH_LOGIN_PATH`. Las variables `VITE_*` son públicas: nunca contienen secretos. El proxy `/api` de Vite solo sirve en desarrollo. Producción requiere CORS con origen explícito y credenciales o proxy de mismo origen.

## Pendientes para el siguiente avance

1. Confirmar MySQL frente a PostgreSQL y reconciliar modelo, migraciones y diagrama.
2. Implementar identidad: usuario, tienda, roles, login, bloqueo tras intentos y autorización por tienda/cliente. El `storeId` de una URL no constituye autorización.
3. Acordar contrato de sesión y errores de identidad. Validar con una API real antes de activar el acceso.
4. Implementar listados por corte y pago completo; eliminar contradicciones del PDF sobre mora y cardinalidad de pagos.
5. Mantener cálculo financiero en servidor, sin IGV, seguro o pasarela bancaria ajenos al alcance.
6. Vincular el dashboard al perfil autenticado y después construir clientes, productos y compras sobre las rutas existentes.

No se incluyeron credenciales, propiedades privadas del ZIP ni el código del backend en el repositorio frontend.

## Avance 03: registro de vendedor o cliente

Ruta frontend: `/#/registro`, enlazada desde «Solicitar una cuenta». Primer paso: selección explícita de perfil; segundo: formulario. Se puede cambiar de perfil y volver al login. El registro no llama al endpoint de creación de clientes: ese endpoint no crea identidades ni credenciales.

Campos comunes propuestos: `accountType` (SELLER/CLIENT), `fullName`, `documentType` (DNI), `documentNumber`, `email`, `password`. La confirmación de contraseña se valida localmente y no forma parte de la solicitud. Vendedor añade `businessName` y `ruc` (validación de formato de 11 dígitos, sin verificar existencia). Cliente añade `storeCode`, propuesta de código de vinculación que todavía no existe en el backend. No se envían campos del otro perfil.

Estos campos y validaciones son un contrato propuesto, no DTOs existentes. El nombre completo debe mapearse al modelo de cliente cuando se acuerde el contrato. La política de contraseña (8 a 72 caracteres en la interfaz) deberá armonizarse con la política y los límites de bytes del algoritmo de hash del backend.

La selección SELLER representa una solicitud de alta y no concede ADMIN_TIENDA automáticamente. El servidor debe validar el negocio, aprobar o rechazar el alta y asignar rol/tienda. Para clientes debe verificar el código y la autorización de vinculación. No ofrecer el rol ADMIN_SISTEMA en el registro público.

`PendingRegistrationRepository` cumple el puerto de registro, pero devuelve un mensaje explícito de integración pendiente. Sustituirlo por un adaptador HTTP al implementar y acordar registro, verificación de correo, códigos de tienda y respuestas. No hay persistencia ni transmisión de datos en este avance. Los formularios usan memoria de React; no se almacenan contraseñas en el navegador.

## Avance 04: DNI en el registro

Se reemplazó el nombre de usuario del registro por DNI peruano de 8 dígitos (sin dígito verificador). La vista conserva el documento como texto para no perder ceros iniciales; el contrato propuesto envía `documentType: "DNI"` y `documentNumber`. La validación comprueba formato, no identidad ni existencia en RENIEC. El formulario no exige un alias adicional.

El login conserva temporalmente su contrato `username` porque el backend no implementa identidad aún. Antes de habilitar autenticación real, acordar acceso con DNI, unicidad y selección de tienda si un documento tiene cuentas en varios comercios; no confundir el DNI con un código de vinculación o una autorización. El siguiente avance de identidad deberá actualizar login y API de forma coordinada.

Vincular tienda: propuesta pendiente de backend. La tienda emitiría una invitación; el cliente ingresaría el código; el servidor verificaría existencia, vigencia y autorización, mostraría el negocio correspondiente y registraría la asociación solo después de validar la identidad y/o aprobación del vendedor. No enlazar al cliente con una deuda existente solo por conocer DNI y código. Este avance solo aclara el texto del campo; no implementa invitaciones ni asociaciones reales.

## Avance 05: cuenta de cliente independiente (sustituye la propuesta de vinculación anterior)

Por decisión del usuario se elimina `storeCode` de la interfaz, validación y contrato de registro. El cliente se registra con sus datos personales y puede explorar tiendas y productos sin asociarse previamente a un comercio. Los apartados anteriores que proponen invitaciones/códigos son históricos y quedan descartados.

La identidad del cliente es global. Las condiciones y deudas continúan siendo específicas de cada tienda; registrarse o explorar productos no concede una línea de crédito ni acceso a información de otros clientes. El backend deberá separar la cuenta global de las relaciones comerciales por tienda, revisar el modelo usuario/cliente y determinar cómo se solicita/autoriza crédito al comprar.

El catálogo de tiendas y productos global aún no está implementado en este frontend. El backend recibido expone productos por tienda (`/api/v1/stores/{storeId}/products`), pero no lista tiendas ni implementa identidad global. Para completar la navegación posterior al registro hacen falta el alta real de cuenta, un listado de tiendas y una vista de catálogo que use los endpoints de productos. No simular registro exitoso ni conceder permisos por selección de perfil.

## Avance 06: correo, identidad local y dashboard

El acceso usa `{email, password}`. Correo normalizado a minúsculas. Registro y login funcionan temporalmente sin servidor mediante `LocalIdentityRepository`, seleccionado en el punto de composición `src/app/dependencies.js`. `VITE_IDENTITY_PROVIDER=local` es el valor por defecto. El adaptador HTTP queda separado y ahora recibe correo, por lo que el backend deberá acordar ese cambio antes de habilitarlo.

Las claves locales son `crediflow.local.users.v1`, `crediflow.local.session.v1` y `crediflow.local.events.v1`. Cuentas guardadas con PBKDF2-SHA256, 210000 iteraciones y sal aleatoria de 16 bytes. No se guarda la contraseña original. Se guardan los datos del perfil, hash, sal, identificador de sesión y hasta 100 eventos de entrada/salida. La sesión persiste al recargar; «Cerrar sesión» la elimina. Cerrar una pestaña o navegador NO equivale a un evento de cierre de sesión. Las pestañas del mismo origen sincronizan sesión mediante el evento storage.

Es un mecanismo de demostración local, manipulable desde el navegador; no constituye autenticación ni autorización segura de producción. Las cuentas no se comparten con otros dispositivos, perfiles, dominios o puertos y se pierden si se borran los datos del sitio. Usar datos de prueba. No incluir registros del navegador en Git. La aprobación de vendedores se simula solo como acceso local, sin efectos en el backend.

Dashboard: saludo de la cuenta autenticada, tres indicadores (financiamientos activos, saldo y próximo pago), tabla vacía de financiamientos, navegación a tiendas/productos, historial de pagos y actividad. Los saldos empiezan en cero y no se inventan operaciones financieras. Las tiendas corresponden a cuentas locales SELLER, mostrando únicamente id y nombre del negocio. Todavía no hay gestión de productos ni compras: las vistas muestran estados vacíos claros.

Migración: seleccionar `VITE_IDENTITY_PROVIDER=http`, completar registro, login por correo, recuperación de sesión, logout y adaptadores de consultas reales; sustituir las operaciones temporales de `identity`. No activar HTTP como si la integración estuviera completa: por ahora no restaura sesiones ni registra cuentas. Retirar las tres claves locales y el adaptador local al finalizar la migración. El historial local es una ayuda de pruebas, no auditoría inmutable.

## Vista: catálogo de negocios y productos

Rama `feature/catalogo-negocios-productos`: todos los ajustes de esta vista se realizan en esta misma rama, sin abrir una por cambio pequeño. Las próximas ramas se nombrarán por vista o funcionalidad coherente.

Nuevo contexto `catalog` separado en domain (puerto), application (consultas y búsqueda), infrastructure (adaptador local y ejemplos) y presentation (interfaz). La composición se realiza en `app/dependencies.js`; el dashboard utiliza la vista de catálogo como componente independiente.

Negocios: imagen ilustrativa local, categoría, nombre, descripción, ubicación orientativa y acceso al catálogo. Hay 3 negocios y 9 productos de ejemplo identificados explícitamente; el usuario puede ocultar ejemplos en el panel. Las tiendas locales registradas también aparecen con imagen y descripción predeterminadas hasta incorporar edición de perfil del negocio. No se copian datos privados de usuarios al catálogo.

Productos: se filtran por storeId y muestran imagen, categoría, descripción, precio al contado y disponibilidad orientativa de financiamiento. Búsqueda sin distinción de tildes/mayúsculas, filtro por categoría, carga, reintento y estados vacíos. Los precios de los ejemplos no son ofertas comerciales reales.

Comprar y Simular cuotas abren diálogos informativos para este avance de catálogo. No generan pedidos, transacciones, cuotas calculadas ni deudas. No se muestran importes mensuales ficticios: se calcularán al implementar la simulación con condiciones reales del cliente en cada tienda. El flujo de compra corresponde a otra vista/avance.

Assets SVG originales en `public/catalog`, sin dependencias de imágenes externas. Sustituir el adaptador local por consultas al backend: GET de productos por tienda ya existe; el listado público de negocios con descripción e imagen debe implementarse. Los recursos deberán incluir id, name, category, description, imageUrl y productos con cashPrice, creditPrice, currency y modalidades permitidas. Nunca mezclar productos entre tiendas.
