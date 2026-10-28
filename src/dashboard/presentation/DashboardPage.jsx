import { useState } from 'react';
import { Icon } from '../../shared/presentation/Icon.jsx';
import './dashboard.css';

const tabs = [
  ['inicio', 'Inicio'],
  ['catalogo', 'Tiendas y productos'],
  ['financiamientos', 'Mis financiamientos'],
  ['pagos', 'Historial de pagos'],
];

export function DashboardPage({ session, onSignOut, identity, localMode }) {
  const [view, setView] = useState('inicio');
  const [store, setStore] = useState(null);
  const user = session.user;
  const stores = identity.listStores();
  const titles = {
    inicio: 'Inicio',
    catalogo: 'Tiendas y productos',
    financiamientos: 'Mis financiamientos',
    pagos: 'Historial de pagos',
    actividad: 'Mi actividad',
  };
  function navigate(next) {
    setView(next);
    setStore(null);
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
          <button className="profile-button" onClick={() => navigate('actividad')}>
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
          {view !== 'catalogo' && (
            <button className="catalog-button" onClick={() => navigate('catalogo')}>
              <Icon name="store" size={18} />
              Ir al catálogo
              <Icon name="arrow" size={17} />
            </button>
          )}
        </div>
        {view === 'inicio' && (
          <>
            <div className="summary-grid">
              <Summary
                label="Financiamientos activos"
                value="0"
                icon="list"
                note="Aún no tienes financiamientos"
              />
              <Summary
                label="Saldo pendiente"
                value="S/ 0.00"
                icon="wallet"
                note="Sin obligaciones registradas"
              />
              <Summary
                label="Próximo pago"
                value="Sin pagos"
                icon="calendar"
                note="Tus próximos vencimientos aparecerán aquí"
                accent
              />
            </div>
            <section className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    <Icon name="folder" />
                    Mis financiamientos
                  </h2>
                  <p>Lista de créditos vigentes</p>
                </div>
                <span className="update-label">
                  <span className="status-dot" />
                  Actualizado en esta sesión
                </span>
              </div>
              <div className="finance-table">
                <table>
                  <thead>
                    <tr>
                      {['PRODUCTO / TIENDA', 'MONTO', 'CUOTAS', 'ESTADO', 'ACCIÓN'].map((name) => (
                        <th key={name}>{name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={5}>
                        <Empty
                          icon="folder"
                          title="Tu próximo proyecto empieza aquí"
                          description="Cuando registres una compra al crédito, podrás seguir sus cuotas y fechas de pago desde este panel."
                        >
                          <button className="primary-button" onClick={() => navigate('catalogo')}>
                            Explorar tiendas
                            <Icon name="arrow" size={17} />
                          </button>
                        </Empty>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="panel-bottom">
                <Icon name="shield" size={16} />
                <span>Tus compras y financiamientos estarán organizados en un solo lugar.</span>
              </div>
            </section>
            <div className="dashboard-shortcuts">
              <div>
                <h3>Todo a tu alcance</h3>
                <p>Consulta tu cuenta cuando lo necesites.</p>
              </div>
              <button onClick={() => navigate('pagos')}>
                <Icon name="calendar" />
                Ver historial de pagos
                <Icon name="arrow" size={16} />
              </button>
              <button onClick={() => navigate('actividad')}>
                <Icon name="shield" />
                Revisar mis accesos
                <Icon name="arrow" size={16} />
              </button>
            </div>
          </>
        )}
        {view === 'catalogo' && (
          <section className="dashboard-panel catalog-panel">
            {store ? (
              <>
                <button className="text-button" onClick={() => setStore(null)}>
                  ← Volver a tiendas
                </button>
                <h2>{store.name}</h2>
                <Empty
                  icon="store"
                  title="Esta tienda aún no tiene productos"
                  description="El catálogo se completará al implementar la gestión de productos. No hay compras disponibles todavía."
                />
              </>
            ) : (
              <>
                <div className="panel-heading">
                  <div>
                    <h2>Tiendas disponibles</h2>
                    <p>Negocios creados en este navegador durante las pruebas.</p>
                  </div>
                  <span className="store-count">{stores.length} tiendas</span>
                </div>
                {stores.length ? (
                  <div className="store-grid">
                    {stores.map((entry) => (
                      <article className="store-card" key={entry.id}>
                        <span className="empty-symbol">
                          <Icon name="store" size={27} />
                        </span>
                        <h3>{entry.name}</h3>
                        <p>Tienda local de prueba</p>
                        <button className="secondary-button" onClick={() => setStore(entry)}>
                          Ver productos
                          <Icon name="arrow" size={16} />
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <Empty
                    icon="store"
                    title="Pronto encontrarás tiendas aquí"
                    description="Todavía no hay vendedores registrados en este navegador. Crea una cuenta de vendedor para probar la lista de tiendas."
                  />
                )}
              </>
            )}
          </section>
        )}
        {(view === 'financiamientos' || view === 'pagos') && (
          <section className="dashboard-panel">
            <Empty
              icon={view === 'pagos' ? 'calendar' : 'folder'}
              title={
                view === 'pagos' ? 'Aún no hay pagos registrados' : 'Aún no tienes financiamientos'
              }
              description="Las operaciones aparecerán aquí cuando se implemente el registro de compras y pagos."
            >
              <button className="secondary-button" onClick={() => navigate('catalogo')}>
                Explorar tiendas
              </button>
            </Empty>
          </section>
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
