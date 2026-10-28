import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../shared/presentation/Icon.jsx';
import { FinancingSchedule, paymentDate } from './FinancingSchedule.jsx';
import './financing-payments.css';
import { CardPaymentFields } from './CardPaymentFields.jsx';
import { InstallmentReceiptPage } from './InstallmentReceiptPage.jsx';
import { nextPayableIndex, recordInstallment } from '../application/installmentPayments.js';
import { financingStore } from '../infrastructure/financingStore.js';

export function FinancingPaymentsPage({
  product,
  values,
  result,
  baseDate,
  onBack,
  financingId,
  initialReceipts = [],
}) {
  const [paying, setPaying] = useState(false);
  const [channel, setChannel] = useState('card');
  const [notice, setNotice] = useState('');
  const [card, setCard] = useState(null);
  const [receipt, setReceipt] = useState(initialReceipts.at(-1) || null);
  const [receipts, setReceipts] = useState(initialReceipts);
  const [payingIndex, setPayingIndex] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const heading = useRef(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus();
  }, [paying]);
  const money = (value) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: product.currency }).format(value);
  const nextIndex = nextPayableIndex(result.schedule, receipts);
  const activeIndex = paying ? payingIndex : nextIndex;
  const first = result.schedule[activeIndex];
  const installment = activeIndex + 1;
  const totalPaid = receipts.reduce((sum, item) => sum + item.amount, 0);
  const date =
    activeIndex < 0
      ? 'Sin cuotas pendientes'
      : paymentDate(baseDate, (activeIndex + 1) * result.interval);
  if (showReceipt && receipt)
    return (
      <InstallmentReceiptPage
        product={product}
        result={result}
        receipt={receipt}
        onSchedule={() => {
          setShowReceipt(false);
          setPaying(false);
          window.scrollTo(0, 0);
        }}
      />
    );
  if (paying)
    return (
      <section
        className="purchase-summary installment-payment"
        aria-labelledby="installment-payment-heading"
      >
        <nav className="purchase-breadcrumb" aria-label="Ruta de pago">
          <button onClick={() => setPaying(false)}>Cronograma de pagos</button>
          <span>›</span>
          <strong>Pago de cuota N.º {installment}</strong>
        </nav>
        <h1 ref={heading} tabIndex={-1} id="installment-payment-heading">
          Pagar cuota N.º {installment}
        </h1>
        <p className="purchase-intro">
          Revisa el detalle de tu cuota y selecciona el medio de pago.
        </p>
        <form
          className="purchase-panel"
          onSubmit={(event) => {
            event.preventDefault();
            try {
              const payment = recordInstallment(result.schedule, receipts, payingIndex, {
                id: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
                createdAt: new Date().toISOString(),
                channel,
                card: channel === 'card' ? card : null,
              });
              const updated = financingId
                ? financingStore().pay(financingId, payingIndex, payment)
                : [...receipts, payment];
              setReceipts(updated);
              setReceipt(payment);
              setShowReceipt(true);
            } catch (error) {
              setNotice(error.message);
            }
          }}
        >
          <h2>
            <Icon name="calendar" />
            {product.name}
          </h2>
          <dl className="installment-details">
            <div>
              <dt>Fecha estimada</dt>
              <dd>{date}</dd>
            </div>
            <div>
              <dt>Interés</dt>
              <dd>{money(first.interest)}</dd>
            </div>
            <div>
              <dt>Amortización</dt>
              <dd>{money(first.amortization)}</dd>
            </div>
            <div>
              <dt>Total de la cuota N.º {installment}</dt>
              <dd className="blue">{money(first.payment)}</dd>
            </div>
          </dl>
          <label className="installment-channel">
            Medio de pago
            <select
              value={channel}
              onChange={(event) => {
                setChannel(event.target.value);
                setNotice('');
              }}
            >
              <option value="card">Tarjeta (Débito / Crédito)</option>
              <option value="transfer">Transferencia institucional</option>
              <option value="counter">Ventanilla académica</option>
            </select>
          </label>
          {channel === 'card' && <CardPaymentFields onCardChange={setCard} />}
          <p className="financing-outcome-note">
            Confirmar guarda un pago de prueba en este navegador. No se realizará un cobro real.
          </p>
          <div className="installment-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setPaying(false);
                setNotice('');
              }}
            >
              ← Volver al cronograma
            </button>
            <button type="submit" className="primary-button">
              Confirmar pago de cuota N.º {installment}
              <Icon name="wallet" size={17} />
            </button>
          </div>
          {notice && (
            <p className="purchase-notice" role="status">
              {notice}
            </p>
          )}
        </form>
      </section>
    );
  return (
    <section
      className="financing-outcome financing-payments"
      aria-labelledby="financing-payments-heading"
    >
      <nav className="purchase-breadcrumb" aria-label="Ruta de financiamiento">
        <button onClick={onBack}>Confirmar financiamiento</button>
        <span>›</span>
        <strong aria-current="page">Cronograma de pagos</strong>
      </nav>
      <h1 ref={heading} tabIndex={-1} id="financing-payments-heading">
        Cronograma de pagos
      </h1>
      <p className="financing-outcome-intro">
        Consulta el detalle y liquidación de las cuotas de tu financiamiento.
      </p>
      <section className="financing-outcome-panel installment-summary">
        <header>
          <Icon name="store" />
          <h2>{product.name}</h2>
        </header>
        <dl>
          <div>
            <dt>Monto financiado</dt>
            <dd>{money(product.cashPrice)}</dd>
          </div>
          <div>
            <dt>Plazo acordado</dt>
            <dd>
              {values.term} {values.unit === 'years' ? 'años' : 'meses'}
            </dd>
          </div>
          <div>
            <dt>Tasa ({values.rateType === 'effective' ? 'TEA' : 'TNA'})</dt>
            <dd>{Number(values.annualRate).toFixed(2)}%</dd>
          </div>
          <div>
            <dt>Amortización</dt>
            <dd>{values.amortization === 'french' ? 'Francesa' : 'Alemana'}</dd>
          </div>
          <div className="installment-next">
            <dt>{nextIndex < 0 ? 'Financiamiento completado' : `Cuota N.º ${installment}`}</dt>
            <dd>{money(first?.payment || 0)}</dd>
            <small>Fecha estimada: {date}</small>
          </div>
          <div>
            <dt>{receipt ? 'Saldo restante (prueba)' : 'Total pactado estimado'}</dt>
            <dd>{money(Math.max(0, result.total - totalPaid))}</dd>
          </div>
        </dl>
      </section>
      <FinancingSchedule
        product={product}
        result={result}
        baseDate={baseDate}
        highlightFirst
        paidInstallments={receipts.map((item) => item.installment)}
      />
      <p className="financing-outcome-note">
        Cronograma de prueba: no se ha registrado un contrato ni una deuda. Las fechas y cuotas se
        conservan desde la simulación original.
      </p>
      <div className="installment-actions">
        <button className="secondary-button" onClick={onBack}>
          ← Volver al financiamiento
        </button>
        <button
          className="primary-button"
          disabled={nextIndex < 0}
          onClick={() => {
            setPayingIndex(nextIndex);
            setCard(null);
            setNotice('');
            setPaying(true);
          }}
        >
          <Icon name="wallet" size={17} />
          {nextIndex < 0 ? 'Todas las cuotas pagadas' : `Pagar cuota N.º ${nextIndex + 1}`}
        </button>
      </div>
      {receipt && (
        <button className="secondary-button" onClick={() => setShowReceipt(true)}>
          Ver último comprobante
        </button>
      )}
      {nextIndex < 0 && (
        <p className="purchase-notice">
          No quedan cuotas con importe pendiente. Los períodos de gracia total no requieren pago.
        </p>
      )}
    </section>
  );
}
