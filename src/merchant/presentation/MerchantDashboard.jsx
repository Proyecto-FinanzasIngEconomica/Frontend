import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../shared/presentation/Icon.jsx';
import { merchantRepository as repository } from '../../app/dependencies.js';
import { MerchantShopForm, MerchantProductForm } from './MerchantForms.jsx';
import { FinancingSchedule, paymentDate } from '../../catalog/presentation/FinancingSchedule.jsx';
import { nextPayableIndex } from '../../catalog/application/installmentPayments.js';
import { ProfilePage } from '../../identity/presentation/ProfilePage.jsx';
import '../../dashboard/presentation/dashboard.css';
import './merchant.css';

const navigation = [
  ['inicio', 'Inicio', 'store'],
  ['tienda', 'Mi tienda', 'pin'],
  ['productos', 'Productos', 'cart'],
  ['clientes', 'Clientes', 'user'],
  ['financiamientos', 'Financiamientos', 'folder'],
  ['pagos', 'Pagos recibidos', 'wallet'],
];
const money = (amount, currency = 'PEN') =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(amount);
const balance = (record) =>
  Math.max(
    0,
    record.result.total - record.receipts.reduce((sum, payment) => sum + payment.amount, 0),
  );
const completed = (record) => nextPayableIndex(record.result.schedule, record.receipts) < 0;
const date = (value) =>
  new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', dateStyle: 'medium' }).format(
    new Date(value),
  );
function ProductImage({ src }) {
  return (
    <img
      src={src}
      alt=""
      onError={(event) => {
        if (!event.currentTarget.src.endsWith('/catalog/groceries.svg'))
          event.currentTarget.src = '/catalog/groceries.svg';
      }}
    />
  );
}
function Empty({ children }) {
  return (
    <div className="merchant-empty">
      <Icon name="folder" size={30} />
      <p>{children}</p>
    </div>
  );
}
function FinancingTable({ records, onOpen }) {
  return records.length ? (
    <div className="merchant-table-scroll">
      <table>
        <thead>
          <tr>
            {['Cliente', 'Producto', 'Monto', 'Saldo', 'Cuotas pagadas', 'Estado', 'Acción'].map(
              (label) => (
                <th key={label}>{label}</th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>
                <strong>{record.customer.fullName}</strong>
                <small>{record.customer.documentNumber}</small>
              </td>
              <td>{record.product.name}</td>
              <td>{money(record.product.cashPrice, record.product.currency)}</td>
              <td>{money(balance(record), record.product.currency)}</td>
              <td>
                {record.receipts.length} /{' '}
                {record.result.schedule.filter((row) => row.payment > 0).length}
              </td>
              <td>
                <span className={`merchant-badge ${completed(record) ? 'success' : ''}`}>
                  {completed(record) ? 'Completado' : 'Activo'} (prueba)
                </span>
              </td>
              <td>
                <button className="text-button" onClick={() => onOpen(record)}>
                  Ver detalle →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty>Aún no hay financiamientos de clientes en esta tienda.</Empty>
  );
}

export function MerchantDashboard({ session, identity, onSignOut }) {
  const [view, setView] = useState('inicio');
  const [version, setVersion] = useState(0);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [productForm, setProductForm] = useState(null);
  const [selection, setSelected] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const heading = useRef(null);
  useEffect(() => {
    heading.current?.focus();
    window.scrollTo(0, 0);
  }, [view, selection, customer, productForm]);
  useEffect(() => {
    const refresh = () => setVersion((old) => old + 1);
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);
  let shop;
  let products = [];
  let records = [];
  let readError = '';
  try {
    shop = repository.getShop();
    products = repository.products();
    records = repository.financings();
  } catch (err) {
    readError = err.message;
  }
  const selected = records.find((record) => record.id === selection?.id) || selection;
  function navigate(next) {
    setView(next);
    setSelected(null);
    setCustomer(null);
    setProductForm(null);
    setQuery('');
    setStatus('all');
    setNotice('');
    setError('');
  }
  function refresh(message) {
    setVersion((old) => old + 1);
    setNotice(message);
    setError('');
  }
  const customers = [
    ...new Map(records.map((record) => [record.customer.id, record.customer])).values(),
  ];
  const payments = records
    .flatMap((record) => record.receipts.map((receipt) => ({ record, receipt })))
    .sort((a, b) => b.receipt.createdAt.localeCompare(a.receipt.createdAt));
  const normalized = (value) =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  const matches = (...values) =>
    values.some((value) => normalized(value).includes(normalized(query)));
  const filteredRecords = records.filter(
    (record) =>
      (!customer || record.customer.id === customer.id) &&
      matches(record.customer.fullName, record.customer.documentNumber, record.product.name) &&
      (status === 'all' || (status === 'completed') === completed(record)),
  );
  const filteredProducts = products.filter(
    (item) =>
      matches(item.name, item.category) &&
      (status === 'all' || (status === 'active' ? item.active : !item.active)),
  );
  const label = selected
    ? 'Detalle del financiamiento'
    : customer
      ? 'Detalle del cliente'
      : productForm
        ? productForm.id
          ? 'Editar producto'
          : 'Registrar producto'
        : navigation.find(([key]) => key === view)?.[1] ||
          (view === 'perfil' ? 'Mi perfil' : 'Actividad de acceso');
  function totals(items, getter) {
    const currencies = [...new Set(items.map((item) => item.product.currency))];
    return currencies.length
      ? currencies
          .map((currency) =>
            money(
              items
                .filter((item) => item.product.currency === currency)
                .reduce((sum, item) => sum + getter(item), 0),
              currency,
            ),
          )
          .join(' · ')
      : money(0);
  }
  return (
    <div className="merchant-shell">
      <aside className="merchant-sidebar">
        <a className="brand" href="#/inicio" onClick={() => navigate('inicio')}>
          <span className="brand-symbol">
            <Icon name="store" size={26} />
          </span>
          <span>
            <span className="brand-name">CrediFlow</span>
            <span className="brand-caption">ADMINISTRACIÓN DE TIENDA</span>
          </span>
        </a>
        <div className="merchant-shop-label">
          <small>TU NEGOCIO</small>
          <strong>{shop?.name || session.user.businessName}</strong>
          <span>{shop?.published ? 'Publicada en el catálogo' : 'Registro por completar'}</span>
        </div>
        <nav aria-label="Administración de tienda">
          {navigation.map(([key, title, icon]) => (
            <button
              key={key}
              className={view === key ? 'active' : ''}
              aria-current={view === key ? 'page' : undefined}
              onClick={() => navigate(key)}
            >
              <Icon name={icon} size={19} />
              {title}
            </button>
          ))}
        </nav>
        <div className="merchant-sidebar-bottom">
          <button onClick={() => navigate('perfil')}>
            <Icon name="user" size={19} />
            Mi perfil
          </button>
          <button onClick={onSignOut}>
            <Icon name="lock" size={19} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="merchant-content">
        <header className="merchant-topbar">
          <span>Panel de administrador de tienda</span>
          <button className="profile-button" onClick={() => navigate('perfil')}>
            <span>
              <strong>{session.user.fullName}</strong>
              <small>VENDEDOR</small>
            </span>
            <span className="avatar">
              <Icon name="user" />
            </span>
          </button>
        </header>
        <main className="merchant-main">
          <div className="local-mode">
            <span>
              <span className="status-dot" />
              Administración local de prueba
            </span>
            <span>Datos de este navegador · Sin cobros reales</span>
          </div>
          {view !== 'perfil' && (
            <>
              <div className="merchant-breadcrumb">
                Mi tienda <span>›</span> {label}
              </div>
              <div className="merchant-title">
                <div>
                  <h1 ref={heading} tabIndex={-1}>
                    {label}
                  </h1>
                  <p>
                    {selected
                      ? 'Condiciones, cronograma y pagos registrados del cliente.'
                      : 'Administra tu negocio, productos y financiamientos en un solo lugar.'}
                  </p>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => refresh('Información actualizada.')}
                >
                  Actualizar
                </button>
              </div>
            </>
          )}
          {(error || readError) && (
            <p className="merchant-error" role="alert">
              {error || readError}
            </p>
          )}
          {notice && (
            <p className="merchant-notice" role="status">
              {notice}
            </p>
          )}
          {selected ? (
            <>
              <button className="text-button" onClick={() => setSelected(null)}>
                ← Volver al listado
              </button>
              <section className="merchant-panel merchant-detail">
                <div className="account-product">
                  <ProductImage src={selected.product.imageUrl} />
                  <div>
                    <h2>{selected.product.name}</h2>
                    <p>{selected.product.description}</p>
                  </div>
                  <span className="merchant-badge">
                    {completed(selected) ? 'Completado' : 'Activo'} (prueba)
                  </span>
                </div>
                <dl>
                  <div>
                    <dt>Cliente</dt>
                    <dd>{selected.customer.fullName}</dd>
                  </div>
                  <div>
                    <dt>DNI</dt>
                    <dd>{selected.customer.documentNumber}</dd>
                  </div>
                  <div>
                    <dt>Contacto</dt>
                    <dd>
                      {selected.customer.email}
                      <br />
                      {selected.customer.phone || 'Sin teléfono'}
                    </dd>
                  </div>
                  <div>
                    <dt>Monto financiado</dt>
                    <dd>{money(selected.product.cashPrice, selected.product.currency)}</dd>
                  </div>
                  <div>
                    <dt>Saldo pendiente</dt>
                    <dd>{money(balance(selected), selected.product.currency)}</dd>
                  </div>
                  <div>
                    <dt>Tasa y plazo</dt>
                    <dd>
                      {selected.values.annualRate}% anual · {selected.values.term}{' '}
                      {selected.values.unit === 'years' ? 'años' : 'meses'}
                    </dd>
                  </div>
                  <div>
                    <dt>Amortización</dt>
                    <dd>{selected.values.amortization === 'french' ? 'Francesa' : 'Alemana'}</dd>
                  </div>
                  <div>
                    <dt>Aceptado el</dt>
                    <dd>{date(selected.acceptedAt)}</dd>
                  </div>
                  <div>
                    <dt>Cuotas pagadas</dt>
                    <dd>{selected.receipts.length}</dd>
                  </div>
                </dl>
              </section>
              <FinancingSchedule
                product={selected.product}
                result={selected.result}
                baseDate={selected.baseDate}
                paidInstallments={selected.receipts.map((item) => item.installment)}
              />
              <section className="merchant-panel">
                <h2>Pagos del financiamiento</h2>
                {selected.receipts.length ? (
                  selected.receipts.map((payment) => (
                    <div className="merchant-payment" key={payment.id}>
                      <strong>Cuota N.º {payment.installment}</strong>
                      <span>{date(payment.createdAt)}</span>
                      <span>{money(payment.amount, selected.product.currency)}</span>
                      <small>{payment.id} · Pago de prueba</small>
                    </div>
                  ))
                ) : (
                  <Empty>Este cliente todavía no ha pagado cuotas.</Empty>
                )}
              </section>
            </>
          ) : customer ? (
            <>
              <button className="text-button" onClick={() => setCustomer(null)}>
                ← Volver a clientes
              </button>
              <section className="merchant-panel">
                <h2>{customer.fullName}</h2>
                <p>
                  DNI: {customer.documentNumber} · {customer.email} ·{' '}
                  {customer.phone || 'Sin teléfono'}
                </p>
                <p>
                  {records.filter((record) => record.customer.id === customer.id).length}{' '}
                  financiamientos asociados a esta tienda
                </p>
                <FinancingTable records={filteredRecords} onOpen={setSelected} />
              </section>
            </>
          ) : (
            <>
              {view === 'inicio' && (
                <>
                  <div className="merchant-stats">
                    {[
                      ['Productos activos', products.filter((item) => item.active).length, 'cart'],
                      ['Clientes con financiamiento', customers.length, 'user'],
                      [
                        'Financiamientos activos',
                        records.filter((item) => !completed(item)).length,
                        'folder',
                      ],
                      ['Saldo por cobrar', totals(records, balance), 'wallet'],
                    ].map(([title, value, icon]) => (
                      <article key={title}>
                        <span>
                          <Icon name={icon} size={22} />
                        </span>
                        <small>{title}</small>
                        <strong>{value}</strong>
                      </article>
                    ))}
                  </div>
                  {!shop?.published && (
                    <div className="merchant-setup">
                      <div>
                        <h2>Prepara tu tienda para recibir clientes</h2>
                        <p>
                          Completa los datos del negocio, publícalo y agrega tus primeros productos.
                        </p>
                      </div>
                      <button className="primary-button" onClick={() => navigate('tienda')}>
                        Configurar tienda →
                      </button>
                    </div>
                  )}
                  <div className="merchant-quick-actions">
                    <button
                      className="secondary-button"
                      onClick={() => {
                        navigate('productos');
                        setProductForm({});
                      }}
                    >
                      + Registrar producto
                    </button>
                    <button className="secondary-button" onClick={() => navigate('clientes')}>
                      Ver clientes
                    </button>
                    <button className="secondary-button" onClick={() => navigate('pagos')}>
                      Ver pagos recibidos
                    </button>
                  </div>
                  <section className="merchant-panel">
                    <div className="merchant-panel-heading">
                      <h2>Financiamientos recientes</h2>
                      <button className="text-button" onClick={() => navigate('financiamientos')}>
                        Ver todos →
                      </button>
                    </div>
                    <FinancingTable
                      records={[...records]
                        .sort((a, b) => b.acceptedAt.localeCompare(a.acceptedAt))
                        .slice(0, 5)}
                      onOpen={setSelected}
                    />
                  </section>
                  <section className="merchant-panel">
                    <h2>Actividad de la tienda</h2>
                    <p>
                      Tienda: {shop?.published ? 'Publicada' : 'Por publicar'} · Productos
                      registrados: {products.length} · Pagos recibidos: {payments.length}
                    </p>
                    <p>
                      Total recibido (prueba):{' '}
                      {totals(records, (record) =>
                        record.receipts.reduce((sum, payment) => sum + payment.amount, 0),
                      )}
                    </p>
                  </section>
                </>
              )}
              {view === 'tienda' && shop && (
                <MerchantShopForm
                  key={`shop-${version}`}
                  shop={shop}
                  repository={repository}
                  onSaved={() =>
                    refresh('Datos de la tienda guardados. El catálogo ya refleja su publicación.')
                  }
                />
              )}
              {view === 'productos' &&
                (productForm ? (
                  <MerchantProductForm
                    key={productForm.id || 'new'}
                    product={productForm.id ? productForm : null}
                    repository={repository}
                    onCancel={() => setProductForm(null)}
                    onSaved={() => {
                      setProductForm(null);
                      refresh('Producto guardado correctamente.');
                    }}
                  />
                ) : (
                  <section className="merchant-panel">
                    <div className="merchant-panel-heading">
                      <div>
                        <h2>Catálogo de productos</h2>
                        <p>{products.length} productos registrados</p>
                      </div>
                      <button className="primary-button" onClick={() => setProductForm({})}>
                        + Registrar producto
                      </button>
                    </div>
                    <div className="merchant-toolbar">
                      <label>
                        <Icon name="search" size={18} />
                        <input
                          type="search"
                          placeholder="Buscar por nombre o categoría"
                          aria-label="Buscar productos"
                          value={query}
                          onChange={(event) => setQuery(event.target.value)}
                        />
                      </label>
                      <select
                        aria-label="Estado del producto"
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                      >
                        <option value="all">Todos los estados</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                      </select>
                    </div>
                    {filteredProducts.length ? (
                      <div className="merchant-table-scroll">
                        <table>
                          <thead>
                            <tr>
                              {[
                                'Producto',
                                'Precio',
                                'Stock',
                                'Financiamiento',
                                'Estado',
                                'Acciones',
                              ].map((title) => (
                                <th key={title}>{title}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.map((item) => (
                              <tr key={item.id}>
                                <td>
                                  <div className="merchant-product-cell">
                                    <ProductImage src={item.imageUrl} />
                                    <div>
                                      <strong>{item.name}</strong>
                                      <small>{item.category}</small>
                                    </div>
                                  </div>
                                </td>
                                <td>{money(item.cashPrice)}</td>
                                <td>{item.stock}</td>
                                <td>{item.installmentsAllowed ? 'Permitido' : 'No disponible'}</td>
                                <td>
                                  <span className="merchant-badge">
                                    {!item.active
                                      ? 'Inactivo'
                                      : item.stock === 0
                                        ? 'Sin stock'
                                        : 'Activo'}
                                  </span>
                                </td>
                                <td>
                                  <div className="merchant-row-actions">
                                    <button
                                      className="text-button"
                                      onClick={() => setProductForm(item)}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      className="text-button"
                                      onClick={() => {
                                        try {
                                          repository.saveProduct({ ...item, active: !item.active });
                                          refresh(
                                            item.active
                                              ? 'Producto desactivado.'
                                              : 'Producto activado.',
                                          );
                                        } catch (err) {
                                          setError(err.message);
                                        }
                                      }}
                                    >
                                      {item.active ? 'Desactivar' : 'Activar'}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <Empty>
                        {query || status !== 'all'
                          ? 'No hay productos que coincidan con los filtros.'
                          : 'Registra tu primer producto para comenzar.'}
                      </Empty>
                    )}
                  </section>
                ))}
              {view === 'clientes' && (
                <section className="merchant-panel">
                  <div className="merchant-panel-heading">
                    <h2>Clientes con financiamiento</h2>
                    <span className="merchant-badge">{customers.length} clientes</span>
                  </div>
                  <div className="merchant-toolbar">
                    <label>
                      <Icon name="search" size={18} />
                      <input
                        type="search"
                        placeholder="Buscar por nombre, DNI o correo"
                        aria-label="Buscar clientes"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                      />
                    </label>
                  </div>
                  {customers
                    .filter((item) => matches(item.fullName, item.documentNumber, item.email))
                    .map((item) => {
                      const loans = records.filter((record) => record.customer.id === item.id);
                      return (
                        <article className="merchant-customer" key={item.id}>
                          <span className="avatar">
                            <Icon name="user" />
                          </span>
                          <div>
                            <h3>{item.fullName}</h3>
                            <p>
                              DNI: {item.documentNumber} · {item.email}
                            </p>
                            <small>
                              {loans.length} financiamientos · Saldo: {totals(loans, balance)}
                            </small>
                          </div>
                          <button className="secondary-button" onClick={() => setCustomer(item)}>
                            Ver cliente →
                          </button>
                        </article>
                      );
                    })}
                  {customers.filter((item) =>
                    matches(item.fullName, item.documentNumber, item.email),
                  ).length === 0 && (
                    <Empty>
                      {query
                        ? 'No encontramos clientes con esos datos.'
                        : 'Los clientes aparecerán cuando acepten un financiamiento de un producto de tu tienda.'}
                    </Empty>
                  )}
                </section>
              )}
              {view === 'financiamientos' && (
                <section className="merchant-panel">
                  <div className="merchant-toolbar">
                    <label>
                      <Icon name="search" size={18} />
                      <input
                        type="search"
                        placeholder="Buscar cliente, DNI o producto"
                        aria-label="Buscar financiamientos"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                      />
                    </label>
                    <select
                      aria-label="Estado del financiamiento"
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                    >
                      <option value="all">Todos</option>
                      <option value="active">Activos</option>
                      <option value="completed">Completados</option>
                    </select>
                  </div>
                  <FinancingTable records={filteredRecords} onOpen={setSelected} />
                </section>
              )}
              {view === 'pagos' && (
                <section className="merchant-panel">
                  <h2>Pagos recibidos</h2>
                  <div className="merchant-toolbar">
                    <label>
                      <Icon name="search" size={18} />
                      <input
                        type="search"
                        placeholder="Buscar cliente, producto o recibo"
                        aria-label="Buscar pagos"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                      />
                    </label>
                  </div>
                  {payments
                    .filter(({ record, receipt }) =>
                      matches(record.customer.fullName, record.product.name, receipt.id),
                    )
                    .map(({ record, receipt }) => (
                      <article className="merchant-payment" key={receipt.id}>
                        <div>
                          <strong>{record.customer.fullName}</strong>
                          <small>
                            {record.product.name} · Cuota N.º {receipt.installment}
                          </small>
                        </div>
                        <span>{date(receipt.createdAt)}</span>
                        <strong>{money(receipt.amount, record.product.currency)}</strong>
                        <span className="merchant-badge">Pago de prueba</span>
                        <button className="text-button" onClick={() => setSelected(record)}>
                          Ver financiamiento →
                        </button>
                      </article>
                    ))}
                  {payments.filter(({ record, receipt }) =>
                    matches(record.customer.fullName, record.product.name, receipt.id),
                  ).length === 0 && <Empty>No hay pagos recibidos que mostrar.</Empty>}
                </section>
              )}
              {view === 'perfil' && (
                <ProfilePage
                  user={session.user}
                  identity={identity}
                  onHome={() => navigate('inicio')}
                  onSignOut={onSignOut}
                  onActivity={() => navigate('actividad')}
                />
              )}
              {view === 'actividad' && (
                <section className="merchant-panel">
                  <h2>Actividad de acceso</h2>
                  {identity.getActivity(session.user.id).map((event) => (
                    <div className="merchant-payment" key={event.id}>
                      <strong>
                        {event.action === 'LOGIN' ? 'Inicio de sesión' : 'Cierre de sesión'}
                      </strong>
                      <span>{date(event.at)}</span>
                    </div>
                  ))}
                </section>
              )}
            </>
          )}
          <p className="merchant-footnote">
            Panel local de prueba. Los productos y operaciones se guardan en este navegador. Los
            financiamientos y pagos no generan cobros reales.
          </p>
        </main>
      </div>
    </div>
  );
}
