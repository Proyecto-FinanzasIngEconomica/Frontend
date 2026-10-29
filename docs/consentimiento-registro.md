# Consentimiento en el registro

El formulario compartido por clientes y vendedores requiere marcar explícitamente la aceptación del tratamiento de datos. La casilla se inicia desmarcada y se reinicia al seleccionar un tipo de cuenta. Sin aceptarla, el botón de registro está deshabilitado; la validación del caso de uso y el repositorio local también rechazan su omisión.

El enlace **Política de Privacidad** abre un diálogo sin enviar el formulario, aceptar automáticamente ni perder los datos escritos. Puede cerrarse con Escape, el botón de cierre o **Volver al registro**.

La política es un documento provisional para pruebas, identificado con la versión `provisional-2026-10-28-v1`. Describe finalidades, datos del negocio y clientes, acceso del vendedor a los financiamientos de su tienda y almacenamiento en el navegador. No incluye consentimiento publicitario.

La solicitud contiene `dataConsent: { accepted: true, policyVersion }`. El repositorio local comprueba la versión y añade `acceptedAt` en formato ISO al guardar la cuenta. No acepta una fecha suministrada por el formulario. Las cuentas existentes conservan su acceso; no se inventa una aceptación retroactiva.

Antes de producción debe sustituirse el texto provisional por la política del responsable del servicio y actualizar su versión. El backend debe validar la aceptación y versión vigente, asignar la fecha del servidor y persistir la evidencia junto con la cuenta. La persistencia local actual no es un registro de auditoría inmutable ni sustituye esa implementación.
