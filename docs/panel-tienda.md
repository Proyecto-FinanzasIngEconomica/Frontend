# Panel de administración de tienda

El inicio de sesión de una cuenta `SELLER` abre el panel de tienda. Las cuentas `CLIENT` conservan el catálogo y su panel de financiamientos.

## Vistas implementadas

| Vista                       | Datos y acciones                                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Inicio                      | Productos activos, clientes con financiamiento, créditos activos, saldo por cobrar por moneda, financiamientos recientes y accesos rápidos. |
| Mi tienda                   | Registro y edición de nombre comercial, RUC, categoría, dirección, correo, teléfono y descripción. Publicar o retirar del catálogo.         |
| Productos                   | Búsqueda por nombre y categoría, filtro de estado, precio, stock, disponibilidad de financiamiento y activación/desactivación.              |
| Registrar / editar producto | Nombre, categoría, descripción, precio PEN, stock, subida de imagen con vista previa, financiamiento permitido y estado.                    |
| Clientes                    | Clientes con al menos un financiamiento asociado a la tienda, búsqueda por nombre, DNI o correo, cantidad de créditos y saldo.              |
| Detalle del cliente         | Datos de contacto y listado de sus financiamientos exclusivamente en esta tienda.                                                           |
| Financiamientos             | Búsqueda por cliente, DNI o producto; filtros activo/completado; monto, saldo y cuotas pagadas.                                             |
| Detalle del financiamiento  | Producto contratado, cliente, condiciones originales, cronograma compartido con el cliente y pagos registrados. Vista de consulta.          |
| Pagos recibidos             | Historial de pagos simulados, cliente, producto, cuota, monto, fecha y acceso al financiamiento. Búsqueda por cliente, producto o recibo.   |
| Mi perfil / actividad       | Perfil y teléfono de contacto del vendedor, actividad de acceso y cierre de sesión.                                                         |

## Recorrido de prueba

1. Registra una cuenta de vendedor e inicia sesión.
2. En **Mi tienda**, completa los datos y marca **Publicar tienda en el catálogo**.
3. En **Productos**, registra un producto activo, con stock y financiamiento permitido.
4. Cierra sesión y entra con una cuenta de cliente en el mismo navegador y origen.
5. Entra al negocio desde el catálogo, selecciona el producto y acepta su financiamiento.
6. Paga una cuota de prueba.
7. Vuelve a entrar como vendedor. El cliente aparece en **Clientes**, su crédito en **Financiamientos** y la cuota en **Pagos recibidos**.
8. Abre el detalle para consultar el mismo cronograma y el saldo actualizado.

## Persistencia e integración

- Las fotos se suben desde el equipo (JPG, PNG o WebP, hasta 10 MB), se optimizan a un máximo de 1000 píxeles de lado y se guardan junto con el producto en el navegador. Se pueden reemplazar o quitar. Para producción, se necesita almacenamiento de archivos mediante la API.
- Tiendas y productos usan `localStorage`; los identificadores del vendedor y la tienda coinciden.
- Los financiamientos mantienen la copia original del producto y sus condiciones. Editar un producto no cambia los créditos ya aceptados.
- Las consultas del vendedor filtran por `product.storeId`; los clientes sin financiamiento en la tienda no se listan.
- El botón **Actualizar** recarga los datos. Los cambios en otras pestañas del mismo navegador también actualizan el panel.
- Una tienda sin publicar no aparece en el catálogo. Los productos inactivos o sin stock no se ofrecen para nuevas compras.
- La persistencia local no sustituye autenticación ni autorización de servidor. Antes de producción se necesita API con autorización por tienda, base de datos, control transaccional de stock y pasarela de pagos. No se implementan cobros reales ni descuento de stock por las operaciones de prueba.
