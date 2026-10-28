import { useEffect, useRef } from 'react';
import { Icon } from '../../shared/presentation/Icon.jsx';
import './payment-result.css';

const channels = {
  card: 'Tarjeta (Débito / Crédito)',
  transfer: 'Transferencia institucional',
  counter: 'Ventanilla académica',
};

export function PaymentResultPage({ product, channel, onCatalog, onBack }) {
  const heading = useRef(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  const price = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: product.currency,
  }).format(product.cashPrice);
  return (
    <section className="purchase-summary payment-result" aria-labelledby="payment-result-heading">
      <nav className="purchase-breadcrumb" aria-label="Ruta de compra">
        <button onClick={onCatalog}>Catálogo de Productos</button>
        <span>›</span>
        <button onClick={onBack}>Pago al contado</button>
        <span>›</span>
        <strong aria-current="page">Resultado del pago</strong>
      </nav>
      <article className="payment-result-card">
        <header className="payment-result-header">
          <span className="payment-result-symbol">
            <Icon name="wallet" size={32} />
          </span>
          <span className="payment-result-badge">Pago no procesado</span>
          <h1 ref={heading} tabIndex={-1} id="payment-result-heading">
            Tu pago aún no se ha realizado
          </h1>
          <p>
            El servicio de cobro todavía no está disponible. No se ha realizado ningún cargo ni
            registrado una compra.
          </p>
        </header>
        <section className="payment-result-details" aria-labelledby="payment-result-detail-heading">
          <h2 id="payment-result-detail-heading">Resumen de la operación</h2>
          <div className="payment-result-product">
            <img src={product.imageUrl} alt="" />
            <div>
              <strong>{product.name}</strong>
              <span>Cantidad: 1 unidad</span>
            </div>
          </div>
          <dl>
            <div>
              <dt>Modalidad</dt>
              <dd>Pago al contado</dd>
            </div>
            <div>
              <dt>Medio seleccionado</dt>
              <dd>{channels[channel]}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd className="payment-result-state">Sin procesar</dd>
            </div>
            <div className="payment-result-total">
              <dt>Monto de la compra</dt>
              <dd>{price}</dd>
            </div>
            <div>
              <dt>Monto cobrado</dt>
              <dd>
                {new Intl.NumberFormat('es-PE', {
                  style: 'currency',
                  currency: product.currency,
                }).format(0)}
              </dd>
            </div>
          </dl>
        </section>
        <div className="payment-result-next">
          <Icon name="help" size={20} />
          <div>
            <h2>¿Qué sigue?</h2>
            <p>
              Puedes volver para cambiar el medio de pago o seguir explorando el catálogo. Esta
              operación no se enviará automáticamente; tendrás que confirmarla cuando el servicio
              esté disponible.
            </p>
          </div>
        </div>
        <footer>
          <button className="secondary-button" onClick={onBack}>
            ← Volver al pago
          </button>
          <button className="primary-button" onClick={onCatalog}>
            Volver al catálogo
            <Icon name="arrow" size={17} />
          </button>
        </footer>
      </article>
    </section>
  );
}
