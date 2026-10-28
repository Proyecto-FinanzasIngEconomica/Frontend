import { useState } from 'react';
import { Icon } from '../../shared/presentation/Icon.jsx';
import './purchase-summary.css';
import { CashPaymentPage } from './CashPaymentPage.jsx';
import { FinancingPage } from './FinancingPage.jsx';

export function PurchaseSummaryPage({ product, initialMethod = 'cash', onBack, customerName }) {
  const [method, setMethod] = useState(initialMethod);
  const [notice, setNotice] = useState('');
  const [paying, setPaying] = useState(false);
  const [financing, setFinancing] = useState(initialMethod === 'financed');
  const price = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: product.currency,
  }).format(product.cashPrice);
  const canFinance = product.installmentsAllowed || product.endOfMonthAllowed;
  if (financing)
    return (
      <FinancingPage
        customerName={customerName}
        product={product}
        onCatalog={onBack}
        onBack={() => {
          setFinancing(false);
          window.scrollTo(0, 0);
        }}
      />
    );
  if (paying)
    return (
      <CashPaymentPage
        product={product}
        onCatalog={onBack}
        onBack={() => {
          setPaying(false);
          window.scrollTo(0, 0);
        }}
      />
    );
  return (
    <section className="purchase-summary" aria-labelledby="purchase-heading">
      <nav className="purchase-breadcrumb" aria-label="Ruta de compra">
        <Icon name="store" size={13} />
        <button onClick={onBack}>Catálogo de Productos</button>
        <span>›</span>
        <strong>Resumen de compra</strong>
      </nav>
      <h1 id="purchase-heading">Resumen de compra</h1>
      <p className="purchase-intro">
        Revisa los detalles de tu adquisición y selecciona la modalidad de pago deseada.
      </p>
      <ol className="purchase-steps" aria-label="Progreso de compra">
        <li className="complete">
          <span>1</span>Selección de Producto
        </li>
        <li className="current" aria-current="step">
          <span>2</span>Resumen y Modalidad
        </li>
        <li>
          <span>3</span>Condiciones y Firma
        </li>
      </ol>
      <section className="purchase-panel" aria-labelledby="purchase-detail">
        <h2 id="purchase-detail">
          <Icon name="cart" size={19} />
          Detalle del producto
        </h2>
        <div className="purchase-product">
          <div className="purchase-thumbnail">
            <img src={product.imageUrl} alt="" />
          </div>
          <div className="purchase-product-copy">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <small>
              Cantidad: 1 <span>Precio unitario: {price}</span>
            </small>
          </div>
          <div className="purchase-subtotal">
            <small>Subtotal</small>
            <strong>{price}</strong>
          </div>
        </div>
        <div className="purchase-totals">
          <div>
            <span>Subtotal (1 producto):</span>
            <span>{price}</span>
          </div>
          <div className="purchase-total">
            <div>
              <strong>Total de compra</strong>
              <small>Impuestos de ley incluidos</small>
            </div>
            <strong>{price}</strong>
          </div>
        </div>
      </section>
      <section className="purchase-panel" aria-labelledby="purchase-payment">
        <h2 id="purchase-payment">
          <Icon name="wallet" size={19} />
          Forma de pago
        </h2>
        <p className="purchase-payment-intro">Selecciona cómo deseas cancelar tu compra.</p>
        <div className="purchase-methods" role="radiogroup" aria-labelledby="purchase-payment">
          <label className={`purchase-method ${method === 'cash' ? 'selected' : ''}`}>
            <div className="purchase-method-heading">
              <input
                type="radio"
                name="payment-method"
                value="cash"
                checked={method === 'cash'}
                onChange={() => {
                  setMethod('cash');
                  setNotice('');
                }}
              />
              <strong>Contado</strong>
              <span className="purchase-method-icon">
                <Icon name="wallet" />
              </span>
            </div>
            <p>
              Pago único e inmediato de {price} mediante transferencia institucional, tarjeta de
              débito/crédito o ventanilla académica.
            </p>
          </label>
          <label
            className={`purchase-method ${method === 'financed' ? 'selected' : ''} ${!canFinance ? 'unavailable' : ''}`}
          >
            <div className="purchase-method-heading">
              <input
                type="radio"
                name="payment-method"
                value="financed"
                disabled={!canFinance}
                checked={method === 'financed'}
                onChange={() => {
                  setMethod('financed');
                  setNotice('');
                }}
              />
              <strong>Financiado</strong>
              <span className="purchase-method-icon credit">
                <Icon name="calendar" />
              </span>
            </div>
            <p>
              {canFinance
                ? 'Divide el pago en cuotas mensuales con el programa de crédito sin comprometer tu liquidez académica.'
                : 'Este producto no dispone de financiamiento.'}
            </p>
            <div className="purchase-info">
              <Icon name="help" size={16} />
              <span>Las condiciones de plazo y cuotas se configurarán en el siguiente paso.</span>
            </div>
          </label>
        </div>
      </section>
      <div className="purchase-panel purchase-footer">
        <button className="secondary-button" onClick={onBack}>
          ← Volver al Catálogo
        </button>
        <button
          className="primary-button"
          onClick={() => {
            if (method === 'cash') {
              setPaying(true);
              window.scrollTo(0, 0);
              return;
            }
            setFinancing(true);
            window.scrollTo(0, 0);
          }}
        >
          {method === 'cash' ? 'Proceder al pago al contado' : 'Continuar con financiamiento'}
          <Icon name="arrow" size={17} />
        </button>
      </div>
      {notice && (
        <p className="purchase-notice" role="status">
          {notice}
        </p>
      )}
    </section>
  );
}
