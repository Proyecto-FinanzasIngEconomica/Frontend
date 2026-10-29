import { useEffect, useRef } from 'react';
import { PRIVACY_POLICY_VERSION } from '../domain/privacyPolicy.js';
import { Icon } from '../../shared/presentation/Icon.jsx';

export function PrivacyPolicyDialog({ onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="help-dialog privacy-policy-dialog"
      aria-labelledby="privacy-policy-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <div className="dialog-heading">
        <span className="dialog-icon">
          <Icon name="shield" size={24} />
        </span>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Cerrar política de privacidad"
          autoFocus
        >
          <Icon name="close" />
        </button>
      </div>
      <h2 id="privacy-policy-title">Política de Privacidad</h2>
      <p className="privacy-draft">
        Documento provisional para el entorno de prueba · Versión {PRIVACY_POLICY_VERSION}
      </p>
      <h3>Datos y finalidades</h3>
      <p>
        Para clientes y vendedores, CrediFlow utiliza los datos de registro y contacto para crear la
        cuenta, permitir el acceso y gestionar las compras, financiamientos y pagos de prueba. Para
        vendedores, también utiliza los datos del negocio para registrar y mostrar la tienda y sus
        productos.
      </p>
      <h3>Almacenamiento y acceso</h3>
      <p>
        En el modo local, la información se guarda en este navegador. Se conserva hasta eliminar los
        datos del sitio. Las contraseñas se almacenan como valores derivados, no en texto plano. El
        administrador de una tienda puede consultar los datos de identificación, contacto,
        financiamientos y pagos de los clientes que financien productos de esa tienda.
      </p>
      <h3>Tu decisión</h3>
      <p>
        La aceptación se solicita para completar el registro y se guarda con su fecha y versión. No
        incluye autorización para publicidad. Consultar o cerrar este documento no marca la casilla
        de aceptación. Puedes editar tu teléfono desde Mi perfil; en este entorno puedes eliminar
        los datos locales desde la configuración del navegador.
      </p>
      <h3>Antes de usar datos reales</h3>
      <p>
        Usa datos de prueba. Este documento no es la política definitiva: antes de producción deben
        identificarse el responsable del tratamiento, su canal de contacto, los mecanismos de
        atención de solicitudes, los plazos de conservación y las condiciones del servicio real.
      </p>
      <button type="button" className="primary-button" onClick={onClose}>
        Volver al registro
      </button>
    </dialog>
  );
}
