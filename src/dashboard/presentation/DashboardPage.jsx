import { useState } from 'react';
import { AccountFinancings } from './AccountFinancings.jsx';
import { FinancingPaymentsPage } from '../../catalog/presentation/FinancingPaymentsPage.jsx';
import { Icon } from '../../shared/presentation/Icon.jsx';
import './dashboard.css';
import { CatalogPage } from '../../catalog/presentation/CatalogPage.jsx';
import { loadStores, loadProducts } from '../../app/dependencies.js';
import { ProfilePage } from '../../identity/presentation/ProfilePage.jsx';

const tabs = [
  ['inicio', 'Inicio'],
  ['catalogo', 'Tiendas y productos'],
  ['financiamientos', 'Mis financiamientos'],
  ['pagos', 'Historial de pagos'],
];

export function DashboardPage({ session, onSignOut, identity, localMode }) {
  const [view, setView] = useState('inicio');
  const [selectedFinancing, setSelectedFinancing] = useState(null);
  const user = session.user;
  const titles = {
    inicio: 'Inicio',
    catalogo: 'Tiendas y productos',
    financiamientos: 'Mis financiamientos',
    pagos: 'Historial de pagos',
    actividad: 'Mi actividad',
  };
  function navigate(next) {
    setSelectedFinancing(null);
    setView(next);
    window.scrollTo(0, 0);
  }
  return (
    <div className="app-shell dashboard-shell">
      <header className="dashboard-header">
        <a className="brand" href="#/inicio" onClick={() => navigate('inicio')}>
          <span className="brand-symbol">
            <Icon name="store" size={26} />
          </span>
          <span>
            <span className="brand-name">CrediFlow</span>
            <span className="brand-caption">TU NEGOCIO Y TUS CUENTAS</span>
          </span>
        </a>
        <nav aria-label="Navegación principal">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              className={view === key ? 'active' : ''}
              aria-current={view === key ? 'page' : undefined}
              onClick={() => navigate(key)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="dashboard-user">
          <button className="profile-button" onClick={() => navigate('perfil')}>
            <span>
              <strong>{user.fullName || user.email}</strong>
              <small>{user.accountType === 'SELLER' ? 'VENDEDOR' : 'CLIENTE'}</small>
            </span>
            <span className="avatar">
              <Icon name="user" />
            </span>
          </button>
          <button className="logout-button" onClick={onSignOut}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        {localMode && (
          <div className="local-mode">
            <span>
              <span className="status-dot" />
              Modo local de prueba
            </span>
            <span>Datos guardados únicamente en este navegador</span>
          </div>
        )}
        {!selectedFinancing && view !== 'catalogo' && view !== 'perfil' && (
          <div className="dashboard-title">
            <div>
              <span className="eyebrow">MI CUENTA</span>
              <h1>{titles[view]}</h1>
              <p>
                {view === 'inicio'
                  ? `Bienvenido de nuevo, ${(user.fullName || user.email).split(' ')[0]}. Este es el resumen de tu cuenta.`
                  : view === 'catalogo'
                    ? 'Explora los negocios registrados y descubre sus productos.'
                    : view === 'actividad'
                      ? 'Consulta tus entradas y salidas en este navegador.'
                      : 'Toda la información de tus operaciones, en un solo lugar.'}
              </p>
            </div>
            {!selectedFinancing && view !== 'catalogo' && (
              <button className="catalog-button" onClick={() => navigate('catalogo')}>
                <Icon name="store" size={18} />
                Ir al catálogo
                <Icon name="arrow" size={17} />
              </button>
            )}
          </div>
        )}
        {selectedFinancing ? (
          <FinancingPaymentsPage
            key={selectedFinancing.id}
            {...selectedFinancing}
            financingId={selectedFinancing.id}
            initialReceipts={selectedFinancing.receipts}
            onBack={() => setSelectedFinancing(null)}
          />
        ) : (
          ['inicio', 'financiamientos', 'pagos'].includes(view) && (
            <AccountFinancings
              key={view}
              view={view}
              onOpen={(record) => {
                setSelectedFinancing(record);
                window.scrollTo(0, 0);
              }}
              onCatalog={() => navigate('catalogo')}
            />
          )
        )}
        {view === 'catalogo' && (
          <CatalogPage
            loadStores={loadStores}
            loadProducts={loadProducts}
            customerName={user.fullName || user.email}
          />
        )}
        {view === 'perfil' && (
          <ProfilePage
            user={user}
            identity={identity}
            onHome={() => navigate('inicio')}
            onSignOut={onSignOut}
            onActivity={() => navigate('actividad')}
          />
        )}
        {view === 'actividad' && (
          <section className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <h2>Entradas y salidas</h2>
                <p>{user.email} · Historial local de esta cuenta</p>
              </div>
            </div>
            <ul className="activity-list">
              {identity.getActivity(user.id).map((entry) => (
                <li key={entry.id}>
                  <span className="activity-icon">
                    <Icon name={entry.action === 'LOGIN' ? 'user' : 'lock'} />
                  </span>
                  <div>
                    <strong>
                      {entry.action === 'LOGIN' ? 'Inicio de sesión' : 'Cierre de sesión'}
                    </strong>
                    <span>
                      {new Intl.DateTimeFormat('es-PE', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(entry.at))}
                    </span>
                  </div>
                  <span className="activity-badge">Local</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} CrediFlow</span>
        <span>Más claridad. Mejores cuentas.</span>
      </footer>
    </div>
  );
}
function Summary({ label, value, icon, note, accent }) {
  return (
    <article className="summary-card">
      <div>
        <span>{label}</span>
        <strong className={accent ? 'accent-value' : ''}>{value}</strong>
      </div>
      <span className="summary-icon">
        <Icon name={icon} size={25} />
      </span>
      <p>
        <Icon name={accent ? 'calendar' : 'check'} size={14} />
        {note}
      </p>
    </article>
  );
}
function Empty({ icon, title, description, children }) {
  return (
    <div className="dashboard-empty">
      <span className="empty-symbol">
        <Icon name={icon} size={30} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
