import { useEffect, useRef } from 'react';
import { Icon } from './Icon.jsx';

export function HelpDialog({ topic, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (topic) dialog.showModal();
    else dialog.close();
  }, [topic]);
  return (
    <dialog
      ref={ref}
      className="help-dialog"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-labelledby="help-title"
    >
      <div className="dialog-heading">
        <span className="dialog-icon">
          <Icon name="help" size={23} />
        </span>
        <button className="icon-button" aria-label="Cerrar ayuda" onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>
      <h2 id="help-title">
        {topic === 'password' ? 'Recuperar tu acceso' : 'Solicitar una cuenta'}
      </h2>
      <p>
        {topic === 'password'
          ? 'Contacta al administrador de tu tienda para solicitar el restablecimiento de tu contraseña. Si administras una tienda, contacta al administrador del sistema.'
          : 'El administrador de tu tienda registra tu cuenta y te entrega tus credenciales. Si quieres incorporar tu negocio, solicita el alta al administrador del sistema.'}
      </p>
      <button className="primary-button" onClick={onClose}>
        Entendido
      </button>
    </dialog>
  );
}
