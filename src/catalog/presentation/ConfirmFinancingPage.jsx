import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../shared/presentation/Icon.jsx';
import './confirm-financing.css';
import { FinancingPaymentsPage } from './FinancingPaymentsPage.jsx';
import { financingStore } from '../infrastructure/financingStore.js';

export function ConfirmFinancingPage({
  product,
  values,
  result,
  firstPaymentDate,
  baseDate,
  onBack,
  onModify,
}) {
  const heading = useRef(null);
  const [accepted, setAccepted] = useState(false);
  const [notice, setNotice] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [financingId] = useState(() => crypto.randomUUID());
  const [savedFinancing, setSavedFinancing] = useState(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus();
  }, []);
  const money = (amount) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: product.currency }).format(
      amount,
    );
  const frequency = { monthly: 'Mensual', bimonthly: 'Bimestral', quarterly: 'Trimestral' }[
    values.frequency
  ];
  const capitalShare = (product.cashPrice / result.total) * 100;
  function confirm(event) {
    event.preventDefault();
    if (!accepted) return;
    try {
      setSavedFinancing(
        financingStore().accept({ id: financingId, product, values, result, baseDate }),
      );
      setShowSchedule(true);
    } catch {
      setNotice(
        'No se pudo guardar el financiamiento. Revisa el almacenamiento del navegador y vuelve a intentarlo.',
      );
    }
  }
  if (showSchedule)
    return (
      <FinancingPaymentsPage
        financingId={financingId}
        initialReceipts={savedFinancing?.receipts || []}
        product={product}
        values={values}
        result={result}
        baseDate={baseDate}
        onBack={() => {
          setShowSchedule(false);
          window.scrollTo(0, 0);
          requestAnimationFrame(() => heading.current?.focus());
        }}
      />
    );
  return (
    <section className="confirm-financing" aria-labelledby="confirm-financing-heading">
      <nav className="purchase-breadcrumb" aria-label="Ruta de compra">
        <button onClick={onModify}>Configurar financiamiento</button>
        <span>›</span>
        <button onClick={onBack}>Resultado del financiamiento</button>
        <span>›</span>
        <strong aria-current="page">Confirmar financiamiento</strong>
      </nav>
      <h1 ref={heading} tabIndex={-1} id="confirm-financing-heading">
        <Icon name="shield" size={25} />
        Confirmar financiamiento
      </h1>
      <p className="confirm-financing-intro">
        Revisa el resumen final de las condiciones acordadas antes de generar tu cronograma de pagos
        definitivo.
      </p>
      <form className="confirm-financing-card" onSubmit={confirm}>
        <div className="confirm-financing-product">
          <span className="confirm-financing-icon">
            <img src={product.imageUrl} alt="" />
          </span>
          <div>
            <small>PRODUCTO</small>
            <strong>{product.name}</strong>
          </div>
          <div className="confirm-financing-amount">
            <small>Monto financiado</small>
            <strong>{money(product.cashPrice)}</strong>
          </div>
        </div>
        <section className="confirm-contract" aria-labelledby="confirm-contract-heading">
          <h2 id="confirm-contract-heading">
            <Icon name="sliders" size={17} />
            Condiciones contractuales
          </h2>
          <dl>
            <div>
              <dt>Tasa de interés</dt>
              <dd>
                {Number(values.annualRate).toFixed(2)}% anual (
                {values.rateType === 'effective' ? 'TEA' : 'TNA'})
              </dd>
            </div>
            <div>
              <dt>Plazo seleccionado</dt>
              <dd>
                {values.term} {values.unit === 'years' ? 'años' : 'meses'}
              </dd>
            </div>
            <div>
              <dt>Frecuencia de pago</dt>
              <dd>{frequency}</dd>
            </div>
            <div>
              <dt>Sistema de amortización</dt>
              <dd>
                {values.amortization === 'french'
                  ? 'Francés (cuota fija)'
                  : 'Alemán (capital fijo)'}
              </dd>
            </div>
            <div>
              <dt>Período de gracia</dt>
              <dd>
                {values.grace === 'none'
                  ? 'Sin gracia'
                  : `${values.grace === 'total' ? 'Total' : 'Parcial'} · ${values.gracePeriods} períodos`}
              </dd>
            </div>
            <div>
              <dt>Número de cuotas</dt>
              <dd>{result.periods} períodos de pago</dd>
            </div>
          </dl>
        </section>
        <section className="confirm-breakdown" aria-labelledby="confirm-breakdown-heading">
          <header>
            <h2 id="confirm-breakdown-heading">
              <Icon name="list" size={17} />
              Desglose de cálculo proyectado
            </h2>
            <small>Moneda: {product.currency}</small>
          </header>
          <div className="confirm-metrics">
            <div>
              <span>
                <Icon name="calendar" size={14} />
                {values.amortization === 'french' ? 'Cuota estimada' : 'Primera cuota estimada'}
              </span>
              <strong>{money(result.payment)}</strong>
              <small>
                {values.grace === 'none'
                  ? 'Sin comisiones ni seguros'
                  : 'Importe después del período de gracia'}
              </small>
            </div>
            <div>
              <span>
                <Icon name="wallet" size={14} />
                Total a pagar
              </span>
              <strong>{money(result.total)}</strong>
              <small>Capital financiado + intereses</small>
            </div>
            <div>
              <span>
                <Icon name="arrow" size={14} />
                Interés total estimado
              </span>
              <strong>{money(result.interest)}</strong>
              <small>Calculado para el plazo seleccionado</small>
            </div>
          </div>
          <div className="confirm-share-labels">
            <span>
              ● Capital: {money(product.cashPrice)} ({capitalShare.toFixed(1)}%)
            </span>
            <span>
              ● Interés: {money(result.interest)} ({(100 - capitalShare).toFixed(1)}%)
            </span>
          </div>
          <div
            className="financing-share"
            role="img"
            aria-label={`Capital ${capitalShare.toFixed(1)}%, intereses ${(100 - capitalShare).toFixed(1)}%`}
          >
            <span style={{ width: `${capitalShare}%` }} />
          </div>
          <p>Primera fecha de pago estimada: {firstPaymentDate}</p>
        </section>
        <label className="confirm-acceptance">
          <input
            type="checkbox"
            required
            checked={accepted}
            onChange={(event) => {
              setAccepted(event.target.checked);
              setNotice('');
            }}
          />
          <span>
            Confirmo que deseo contratar este financiamiento bajo las condiciones mostradas.
          </span>
        </label>
        <p className="confirm-financing-note">
          Vista previa. La contratación estará disponible cuando se conecte el servicio de
          financiamiento.
        </p>
        <footer>
          <button className="secondary-button" type="button" onClick={onBack}>
            ← Volver
          </button>
          <button className="primary-button" type="submit" disabled={!accepted}>
            Confirmar financiamiento
            <Icon name="shield" size={16} />
          </button>
        </footer>
        {notice && (
          <p className="purchase-notice" role="status">
            {notice}
          </p>
        )}
      </form>
    </section>
  );
}
