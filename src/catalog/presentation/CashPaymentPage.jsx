import { useState } from 'react';
import { Icon } from '../../shared/presentation/Icon.jsx';
import './cash-payment.css';
import { PaymentResultPage } from './PaymentResultPage.jsx';

export function CashPaymentPage({ product, onBack, onCatalog }) {
  const [channel, setChannel] = useState('card');
  const [confirmed, setConfirmed] = useState(false);
  const price = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: product.currency,
  }).format(product.cashPrice);
  const currencyName = product.currency === 'PEN' ? 'Soles (PEN)' : product.currency;
  function confirm(event) {
    event.preventDefault();
    setConfirmed(true);
    window.scrollTo(0, 0);
  }
  if (confirmed)
    return (
      <PaymentResultPage
        product={product}
        channel={channel}
        onCatalog={onCatalog}
        onBack={() => {
          setConfirmed(false);
          window.scrollTo(0, 0);
        }}
      />
    );
  return (
    <section className="purchase-summary cash-payment" aria-labelledby="cash-heading">
      <nav className="purchase-breadcrumb" aria-label="Ruta de compra">
        <Icon name="store" size={13} />
        <button onClick={onCatalog}>Catálogo de Productos</button>
        <span>›</span>
        <button onClick={onBack}>Resumen de compra</button>
        <span>›</span>
        <strong aria-current="page">Pago al contado</strong>
      </nav>
      <h1 id="cash-heading">Pago al contado</h1>
      <p className="purchase-intro">
        Revisa el detalle de tu adquisición y selecciona tu método de cancelación directa.
      </p>
      <form className="cash-card" onSubmit={confirm}>
        <div className="cash-product">
          <div className="cash-thumbnail">
            <img src={product.imageUrl} alt="" />
          </div>
          <div className="purchase-product-copy">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <small>
              Cantidad: <strong>1 unidad</strong>
              <span>·</span>Modalidad: <b>Pago al contado (Pago único)</b>
            </small>
          </div>
          <div className="cash-total">
            <span>TOTAL A PAGAR</span>
            <strong>{price}</strong>
          </div>
        </div>
        <div className="cash-body">
          <h2>
            <Icon name="wallet" size={19} />
            Método de pago
          </h2>
          <p>Selecciona el canal administrativo con el que registrarás tu cancelación inmediata.</p>
          <label className="cash-label" htmlFor="cash-channel">
            Selecciona el medio de pago <span aria-hidden="true">*</span>
          </label>
          <div className="cash-select">
            <Icon name="wallet" size={18} />
            <select
              id="cash-channel"
              required
              value={channel}
              onChange={(event) => {
                setChannel(event.target.value);
              }}
            >
              <option value="card">Tarjeta (Débito / Crédito)</option>
              <option value="transfer">Transferencia institucional</option>
              <option value="counter">Ventanilla académica</option>
            </select>
          </div>
          <section className="cash-settlement" aria-labelledby="settlement-heading">
            <h3 id="settlement-heading">DETALLE DE LIQUIDACIÓN FINANCIERA</h3>
            <dl>
              <div>
                <dt>Monto a cancelar</dt>
                <dd>{price}</dd>
              </div>
              <div>
                <dt>Moneda oficial</dt>
                <dd>{currencyName}</dd>
              </div>
            </dl>
          </section>
        </div>
        <div className="cash-footer">
          <button type="button" className="cash-back" onClick={onBack}>
            ← Volver
          </button>
          <button type="submit" className="primary-button">
            Confirmar pago <Icon name="arrow" size={17} />
          </button>
        </div>
      </form>
    </section>
  );
}
