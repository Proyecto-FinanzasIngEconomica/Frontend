import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../shared/presentation/Icon.jsx';
import { filterCatalog } from '../application/loadCatalog.js';
import './catalog.css';
import { PurchaseSummaryPage } from './PurchaseSummaryPage.jsx';

const money = (amount, currency) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(amount);
function CatalogImage({ src, alt, fallback }) {
  const [failed, setFailed] = useState(false);
  return (
    <img src={failed ? fallback : src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
  );
}

export function CatalogPage({ loadStores, loadProducts, customerName }) {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const [showDemo, setShowDemo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [action, setAction] = useState(null);
  const [purchase, setPurchase] = useState(null);
  const dialog = useRef(null);
  const heading = useRef(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    (store ? loadProducts(store.id) : loadStores())
      .then((items) => {
        if (active) {
          if (store) setProducts(items);
          else setStores(items);
        }
      })
      .catch(() => {
        if (active) setError('No pudimos cargar el catálogo. Vuelve a intentarlo.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [store, loadStores, loadProducts, retry]);
  useEffect(() => {
    if (action) dialog.current.showModal();
    else dialog.current?.close();
  }, [action]);
  function selectStore(next) {
    setStore(next);
    setQuery('');
    setCategory('Todos');
    requestAnimationFrame(() => {
      heading.current?.focus();
      heading.current?.scrollIntoView({ block: 'start' });
    });
  }
  const allItems = store ? products : stores.filter((item) => showDemo || !item.demo);
  const categories = ['Todos', ...new Set(allItems.map((item) => item.category))];
  const items = filterCatalog(allItems, query).filter(
    (item) => category === 'Todos' || item.category === category,
  );
  if (purchase) {
    return (
      <PurchaseSummaryPage
        product={purchase.product}
        initialMethod={purchase.method}
        customerName={customerName}
        onBack={() => {
          setPurchase(null);
          window.scrollTo(0, 0);
        }}
      />
    );
  }
  return (
    <section className="catalog-view" aria-labelledby="catalog-heading">
      {store && (
        <button className="back-link" onClick={() => selectStore(null)}>
          ← Volver a negocios
        </button>
      )}
      {store ? (
        <div className="selected-store-banner">
          <CatalogImage src={store.imageUrl} alt="" fallback="/catalog/grocery-store.svg" />
          <div>
            <span className="eyebrow">
              {store.category}
              {store.demo ? ' · Ejemplo' : ''}
            </span>
            <h2>{store.name}</h2>
            <p>{store.description}</p>
          </div>
        </div>
      ) : null}
      <div className="catalog-page-title">
        <div>
          <span className="eyebrow">
            {store ? 'ENCUENTRA LO QUE NECESITAS' : 'COMPRA CERCA, VIVE MEJOR'}
          </span>
          <h1 ref={heading} tabIndex={-1} id="catalog-heading">
            {store ? 'Productos' : 'Descubre nuestros negocios'}
          </h1>
          <p>
            {store
              ? 'Explora los productos y revisa sus opciones de compra.'
              : 'Encuentra tu próxima tienda favorita. Todo lo que necesitas, en un solo lugar.'}
          </p>
        </div>
        <span className="catalog-result-count">
          {items.length}{' '}
          {store
            ? items.length === 1
              ? 'producto'
              : 'productos'
            : items.length === 1
              ? 'negocio'
              : 'negocios'}
        </span>
      </div>
      <div className="catalog-toolbar">
        <label className="catalog-search">
          <Icon name="search" size={19} />
          <span className="sr-only">{store ? 'Buscar productos' : 'Buscar negocios'}</span>
          <input
            type="search"
            placeholder={store ? 'Buscar un producto…' : 'Busca por nombre o tipo de negocio…'}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {!store && (
          <label className="demo-switch">
            <input
              type="checkbox"
              checked={showDemo}
              onChange={(event) => {
                setShowDemo(event.target.checked);
                setCategory('Todos');
              }}
            />
            Mostrar ejemplos
          </label>
        )}
      </div>
      <div className="category-filters" aria-label="Filtrar por categoría">
        {categories.map((name) => (
          <button key={name} aria-pressed={category === name} onClick={() => setCategory(name)}>
            {name}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="catalog-state" role="status">
          Cargando catálogo…
        </div>
      ) : error ? (
        <div className="catalog-state" role="alert">
          <p>{error}</p>
          <button className="secondary-button" onClick={() => setRetry(retry + 1)}>
            Reintentar
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="catalog-state">
          <Icon name="store" size={35} />
          <h2>
            {query || category !== 'Todos'
              ? 'No encontramos coincidencias'
              : store
                ? 'Esta tienda aún no tiene productos'
                : 'Aún no hay negocios registrados'}
          </h2>
          <p>
            {query || category !== 'Todos'
              ? 'Prueba con otra búsqueda o categoría.'
              : store
                ? 'Sus productos aparecerán aquí cuando se incorporen al catálogo.'
                : 'Activa los ejemplos para explorar el diseño del catálogo.'}
          </p>
          {(query || category !== 'Todos') && (
            <button
              className="text-button"
              onClick={() => {
                setQuery('');
                setCategory('Todos');
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="catalog-grid">
          {items.map((item) =>
            store ? (
              <article className="product-card" key={item.id}>
                <div className="product-image">
                  <CatalogImage
                    src={item.imageUrl}
                    alt={item.name}
                    fallback="/catalog/groceries.svg"
                  />
                  {item.demo && <span className="demo-badge">Ejemplo</span>}
                </div>
                <div className="product-body">
                  <span className="product-category">{item.category}</span>
                  <h2>{item.name}</h2>
                  <div className="product-price">
                    <strong>{money(item.cashPrice, item.currency)}</strong>
                    <span>al contado</span>
                  </div>
                  <p>{item.description}</p>
                  <div className="credit-note">
                    <Icon name="calendar" size={19} />
                    <div>
                      <span>
                        {item.installmentsAllowed
                          ? 'Opciones de financiamiento'
                          : 'Pago a fin de mes'}
                      </span>
                      <strong>Consulta las condiciones de crédito</strong>
                    </div>
                  </div>
                  <div className="product-actions">
                    <button
                      className="primary-button"
                      onClick={() => {
                        setPurchase({ product: item, method: 'cash' });
                        window.scrollTo(0, 0);
                      }}
                    >
                      <Icon name="cart" size={17} />
                      Comprar
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => {
                        setPurchase({ product: item, method: 'financed' });
                        window.scrollTo(0, 0);
                      }}
                    >
                      <Icon name="sliders" size={17} />
                      Simular cuotas
                    </button>
                  </div>
                </div>
              </article>
            ) : (
              <article className="business-card" key={item.id}>
                <button className="business-card-link" onClick={() => selectStore(item)}>
                  <div className="business-image">
                    <CatalogImage
                      src={item.imageUrl}
                      alt={`Ilustración de ${item.name}`}
                      fallback="/catalog/grocery-store.svg"
                    />
                    {item.demo && <span className="demo-badge">Ejemplo</span>}
                    <span className="business-category">{item.category}</span>
                  </div>
                  <div className="business-body">
                    <span className="business-location">
                      <Icon name="pin" size={14} />
                      {item.location}
                    </span>
                    <h2>{item.name}</h2>
                    <p>{item.description}</p>
                    <div className="business-card-footer">
                      <span>Ver productos</span>
                      <span className="business-arrow">
                        <Icon name="arrow" size={19} />
                      </span>
                    </div>
                  </div>
                </button>
              </article>
            ),
          )}
        </div>
      )}
      <p className="catalog-footnote">
        <Icon name="help" size={15} />
        Los negocios y productos marcados como «Ejemplo» son demostrativos. No generan compras ni
        deudas.
      </p>
      <dialog
        ref={dialog}
        className="help-dialog product-dialog"
        onClose={() => setAction(null)}
        aria-labelledby="product-dialog-title"
      >
        <div className="dialog-heading">
          <span className="dialog-icon">
            <Icon name={action?.type === 'buy' ? 'cart' : 'sliders'} size={25} />
          </span>
          <button
            className="icon-button"
            aria-label="Cerrar detalle"
            onClick={() => setAction(null)}
          >
            <Icon name="close" />
          </button>
        </div>
        <h2 id="product-dialog-title">
          {action?.type === 'buy' ? 'Resumen del producto' : 'Opciones de financiamiento'}
        </h2>
        {action && (
          <>
            <h3>{action.product.name}</h3>
            <div className="dialog-price">
              {money(action.product.cashPrice, action.product.currency)}
            </div>
            <p>
              {action.type === 'buy'
                ? 'Este producto es de ejemplo. El registro de compras se incorporará en el siguiente avance; esta acción no genera ningún cargo.'
                : 'Las cuotas se calcularán con las condiciones autorizadas para el cliente en esta tienda. La simulación financiera se incorporará en el siguiente avance; todavía no hay una cuota calculada.'}
            </p>
            <button className="primary-button" onClick={() => setAction(null)}>
              Seguir explorando
            </button>
          </>
        )}
      </dialog>
    </section>
  );
}
