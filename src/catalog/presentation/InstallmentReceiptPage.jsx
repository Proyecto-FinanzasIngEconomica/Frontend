import { useEffect, useRef } from 'react';
import { Icon } from '../../shared/presentation/Icon.jsx';
import { identity } from '../../app/dependencies.js';
import './installment-receipt.css';

export function InstallmentReceiptPage({ product, result, receipt, onSchedule }) {
  const heading = useRef(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus();
  }, []);
  const money = (value) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: product.currency }).format(value);
  const user = identity.getSession()?.user;
  const method = {
    card: 'Tarjeta',
    transfer: 'Transferencia institucional',
    counter: 'Ventanilla académica',
  }[receipt.channel];
  return (
    <section className="installment-receipt" aria-labelledby="receipt-heading">
      <nav className="purchase-breadcrumb" aria-label="Ruta del comprobante">
        <button onClick={onSchedule}>Cronograma de pagos</button>
        <span>›</span>
        <strong aria-current="page">Comprobante de pago</strong>
      </nav>
      <article className="installment-receipt-card">
        <header>
          <span className="receipt-badge">
            <Icon name="shield" size={14} />
            OPERACIÓN DE PRUEBA
          </span>
          <span className="receipt-check">
            <Icon name="check" size={34} />
          </span>
          <h1 ref={heading} tabIndex={-1} id="receipt-heading">
            Pago realizado
          </h1>
          <p>Pago simulado registrado en este navegador</p>
          <div className="receipt-reference">
            <span>
              N.º recibo: <strong>{receipt.id}</strong>
            </span>
            <span>
              {new Intl.DateTimeFormat('es-PE', {
                timeZone: 'America/Lima',
                dateStyle: 'long',
                timeStyle: 'short',
              }).format(new Date(receipt.createdAt))}
            </span>
          </div>
        </header>
        <div className="receipt-body">
          <div className="receipt-product">
            <img src={product.imageUrl} alt="" />
            <div>
              <small>FINANCIAMIENTO DE PRUEBA</small>
              <strong>{product.name}</strong>
              <span>Cuota N.º {receipt.installment}</span>
            </div>
          </div>
          <div className="receipt-amounts">
            <div>
              <span>Monto abonado (simulado)</span>
              <strong>{money(receipt.amount)}</strong>
              <small>Aplicado a la cuota N.º {receipt.installment}</small>
            </div>
            <div>
              <span>Saldo restante</span>
              <strong>{money(receipt.remaining)}</strong>
              <small>Total inicial: {money(result.total)}</small>
            </div>
          </div>
          <dl className="receipt-details">
            <div>
              <dt>Método de pago</dt>
              <dd>{receipt.card ? `${receipt.card.brand} •••• ${receipt.card.last4}` : method}</dd>
            </div>
            <div>
              <dt>Titular de la cuenta</dt>
              <dd>{user?.fullName || user?.email || 'Cliente'}</dd>
            </div>
            <div>
              <dt>Referencia de operación de prueba</dt>
              <dd>{receipt.id}</dd>
            </div>
          </dl>
          <p className="receipt-demo-note">
            Comprobante de demostración, sin validez bancaria. No se realizó ningún cargo ni
            autorización bancaria. Puedes consultar este pago en el historial de tu cuenta en este
            navegador.
          </p>
        </div>
        <footer>
          <button className="secondary-button" onClick={() => window.print()}>
            Imprimir comprobante
          </button>
          <button className="primary-button" onClick={onSchedule}>
            <Icon name="eye" size={17} />
            Ver financiamiento
          </button>
        </footer>
      </article>
    </section>
  );
}
