import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../shared/presentation/Icon.jsx';
import './financing-result.css';
import { ConfirmFinancingPage } from './ConfirmFinancingPage.jsx';

import { FinancingSchedule, paymentDate } from './FinancingSchedule.jsx';

export function FinancingResultPage({ product, values, result, onModify }) {
  const heading = useRef(null);
  const [confirming, setConfirming] = useState(false);
  const [baseDate] = useState(() =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date()),
  );
  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus();
  }, []);
  const money = (value) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: product.currency }).format(value);
  const frequency = { monthly: 'Mensual', bimonthly: 'Bimestral', quarterly: 'Trimestral' }[
    values.frequency
  ];
  const capitalShare = (product.cashPrice / result.total) * 100;
  const interestSum = result.schedule.reduce((sum, row) => sum + row.interest, 0);
  const amortizedSum = result.schedule.reduce((sum, row) => sum + row.amortization, 0);
  if (confirming)
    return (
      <ConfirmFinancingPage
        product={product}
        values={values}
        result={result}
        baseDate={baseDate}
        firstPaymentDate={paymentDate(baseDate, result.interval)}
        onModify={onModify}
        onBack={() => {
          setConfirming(false);
          window.scrollTo(0, 0);
          requestAnimationFrame(() => heading.current?.focus());
        }}
      />
    );
  return (
    <section className="financing-outcome" aria-labelledby="financing-outcome-heading">
      <span className="financing-outcome-eyebrow">
        <Icon name="shield" size={15} />
        SIMULACIÓN DE FINANCIAMIENTO
      </span>
      <h1 ref={heading} tabIndex={-1} id="financing-outcome-heading">
        Resultado del financiamiento
      </h1>
      <p className="financing-outcome-intro">
        Cronograma estimado de amortización para {product.name}.
      </p>
      <div className="financing-overview">
        <section className="financing-outcome-panel">
          <header>
            <Icon name="sliders" />
            <div>
              <h2>Condiciones</h2>
              <p>Parámetros aplicados a la simulación</p>
            </div>
          </header>
          <dl className="financing-conditions">
            <div>
              <dt>Monto</dt>
              <dd>{money(product.cashPrice)}</dd>
            </div>
            <div>
              <dt>Tasa</dt>
              <dd>
                {values.annualRate}% anual ·{' '}
                {values.rateType === 'effective' ? 'Efectiva' : 'Nominal'}
              </dd>
            </div>
            <div>
              <dt>Plazo</dt>
              <dd>
                {values.term} {values.unit === 'years' ? 'años' : 'meses'}
              </dd>
            </div>
            <div>
              <dt>Frecuencia</dt>
              <dd>{frequency}</dd>
            </div>
            <div>
              <dt>Amortización</dt>
              <dd>{values.amortization === 'french' ? 'Francesa' : 'Alemana'}</dd>
            </div>
            <div>
              <dt>Período de gracia</dt>
              <dd>
                {values.grace === 'none'
                  ? 'Sin gracia'
                  : `${values.grace === 'total' ? 'Total' : 'Parcial'} · ${values.gracePeriods} períodos`}
              </dd>
            </div>
          </dl>
        </section>
        <section className="financing-outcome-panel">
          <header>
            <Icon name="wallet" />
            <div>
              <h2>Resumen</h2>
              <p>Desglose monetario consolidado</p>
            </div>
            <small>{result.periods} períodos</small>
          </header>
          <div className="financing-summary-body">
            <dl className="financing-metrics">
              <div>
                <dt>Número de cuotas</dt>
                <dd>{result.periods}</dd>
              </div>
              <div>
                <dt>
                  {values.amortization === 'french' ? 'Cuota estimada' : 'Primera cuota'}
                  {values.grace !== 'none' ? ' posgracia' : ''}
                </dt>
                <dd className="blue">{money(result.payment)}</dd>
              </div>
              <div>
                <dt>Total de intereses</dt>
                <dd>{money(result.interest)}</dd>
              </div>
              <div>
                <dt>Total a pagar</dt>
                <dd>{money(result.total)}</dd>
              </div>
            </dl>
            <div
              className="financing-share"
              role="img"
              aria-label={`Capital ${capitalShare.toFixed(1)}%, intereses ${(100 - capitalShare).toFixed(1)}%`}
            >
              <span style={{ width: `${capitalShare}%` }} />
            </div>
            <div className="financing-share-labels">
              <span>● Capital ({capitalShare.toFixed(1)}%)</span>
              <span>● Interés ordinario ({(100 - capitalShare).toFixed(1)}%)</span>
            </div>
          </div>
          <footer>
            Primera fecha estimada: {paymentDate(baseDate, result.interval)}
            <span>i = {(result.rate * 100).toFixed(4)}% por período</span>
          </footer>
        </section>
      </div>
      <FinancingSchedule result={result} product={product} baseDate={baseDate} />
      <p className="financing-outcome-note">
        Fechas estimadas desde hoy, con pagos al final de cada período. Simulación sin comisiones ni
        seguros; no representa una aprobación ni registra una deuda.
      </p>
      <div className="financing-outcome-actions">
        <button className="secondary-button" onClick={onModify}>
          <Icon name="sliders" size={16} />
          Modificar condiciones
        </button>
        <button className="primary-button" onClick={() => setConfirming(true)}>
          Continuar
          <Icon name="arrow" size={17} />
        </button>
      </div>
    </section>
  );
}
