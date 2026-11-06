import { Icon } from './Icon.jsx';

export function AuthLayout({ children }) {
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById('main-content');
          main?.setAttribute('tabindex', '-1');
          main?.focus();
        }}
      >
        Saltar al contenido
      </a>
      <header className="site-header">
        <a className="brand" href="#/ingresar" aria-label="CrediFlow, inicio">
          <span className="brand-symbol">
            <Icon name="store" size={25} />
          </span>
          <span>
            <span className="brand-name">CrediFlow</span>
            <span className="brand-caption">EL CRÉDITO DE TU NEGOCIO, EN ORDEN</span>
          </span>
        </a>
        <span className="header-note">
          <span className="status-dot" />
          Hecho para tu negocio
        </span>
      </header>
      {children}
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} CrediFlow</span>
        <span>Más claridad. Mejores cuentas.</span>
      </footer>
    </div>
  );
}
