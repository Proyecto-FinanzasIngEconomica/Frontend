import { useState } from 'react';
import { financingStore } from '../../catalog/infrastructure/financingStore.js';
import { nextPayableIndex } from '../../catalog/application/installmentPayments.js';
import { paymentDate } from '../../catalog/presentation/FinancingSchedule.jsx';
import { InstallmentReceiptPage } from '../../catalog/presentation/InstallmentReceiptPage.jsx';
import './account-financings.css';

export function AccountFinancings({ view, onOpen, onCatalog }) {
  const [receipt, setReceipt] = useState(null);
  let records = [];
  let error = '';
  try {
    records = financingStore().list();
  } catch {
    error =
      'No pudimos leer tus financiamientos guardados. Revisa el almacenamiento del navegador.';
  }
  const money = (amount, currency = 'PEN') =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(amount);
  const remaining = (record) =>
    Math.max(0, record.result.total - record.receipts.reduce((sum, item) => sum + item.amount, 0));
  const active = records.filter(
    (record) => nextPayableIndex(record.result.schedule, record.receipts) >= 0,
  );
  const payments = records
    .flatMap((record) => record.receipts.map((payment) => ({ record, payment })))
    .sort((a, b) => b.payment.createdAt.localeCompare(a.payment.createdAt));
  const next = active
    .map((record) => ({ record, index: nextPayableIndex(record.result.schedule, record.receipts) }))
    .sort((a, b) => {
      const date = (item) => {
        const [y, m, d] = item.record.baseDate.split('-').map(Number);
        return Date.UTC(y, m - 1 + (item.index + 1) * item.record.result.interval, d);
      };
      return date(a) - date(b);
    })[0];
  if (receipt)
    return (
      <InstallmentReceiptPage
        product={receipt.record.product}
        result={receipt.record.result}
        receipt={receipt.payment}
        onSchedule={() => {
          setReceipt(null);
          onOpen(receipt.record);
        }}
      />
    );
  return (
    <div className="account-financings">
      {error && <p role="alert">{error}</p>}
      {view === 'inicio' && (
        <div className="summary-grid">
          <article className="summary-card">
            <div>
              <span>Financiamientos activos</span>
              <strong>{active.length}</strong>
            </div>
            <p>Registrados en este navegador</p>
          </article>
          <article className="summary-card">
            <div>
              <span>Saldo pendiente por moneda</span>
              <strong>
                {records.length
                  ? [...new Set(records.map((r) => r.product.currency))]
                      .map((currency) =>
                        money(
                          records
                            .filter((r) => r.product.currency === currency)
                            .reduce((sum, r) => sum + remaining(r), 0),
                          currency,
                        ),
                      )
                      .join(' · ')
                  : money(0)}
              </strong>
            </div>
            <p>Operaciones de prueba</p>
          </article>
          <article className="summary-card">
            <div>
              <span>Próximo pago</span>
              <strong>
                {next
                  ? money(
                      next.record.result.schedule[next.index].payment,
                      next.record.product.currency,
                    )
                  : 'Sin pagos pendientes'}
              </strong>
            </div>
            <p>
              {next
                ? paymentDate(next.record.baseDate, (next.index + 1) * next.record.result.interval)
                : 'Todas tus cuotas al día'}
            </p>
            {next && (
              <button className="text-button" onClick={() => onOpen(next.record)}>
                Ver financiamiento →
              </button>
            )}
          </article>
        </div>
      )}
      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h2>{view === 'pagos' ? 'Historial de pagos' : 'Mis financiamientos'}</h2>
            <p>Operaciones de prueba guardadas en tu cuenta local</p>
          </div>
        </div>
        {view === 'pagos' ? (
          <div className="account-payment-list">
            {payments.map(({ record, payment }) => (
              <article key={payment.id} className="account-payment">
                <img src={record.product.imageUrl} alt="" />
                <div>
                  <h3>{record.product.name}</h3>
                  <p>
                    Cuota N.º {payment.installment} ·{' '}
                    {new Intl.DateTimeFormat('es-PE', {
                      timeZone: 'America/Lima',
                      dateStyle: 'medium',
                    }).format(new Date(payment.createdAt))}
                  </p>
                  <span>Pagado (prueba) · {money(payment.amount, record.product.currency)}</span>
                </div>
                <div className="account-payment-actions">
                  <button className="secondary-button" onClick={() => onOpen(record)}>
                    Ver financiamiento
                  </button>
                  <button className="text-button" onClick={() => setReceipt({ record, payment })}>
                    Ver comprobante
                  </button>
                </div>
              </article>
            ))}
            {payments.length === 0 && (
              <p className="account-empty">
                Aún no hay pagos registrados. Tus comprobantes aparecerán aquí después de pagar una
                cuota.
              </p>
            )}
          </div>
        ) : (
          <div className="account-financing-list">
            {records.map((record) => (
              <article className="account-financing" key={record.id}>
                <div className="account-product">
                  <img src={record.product.imageUrl} alt="" />
                  <div>
                    <h3>{record.product.name}</h3>
                    <p>{record.product.description}</p>
                  </div>
                </div>
                <dl>
                  <div>
                    <dt>Monto financiado</dt>
                    <dd>{money(record.product.cashPrice, record.product.currency)}</dd>
                  </div>
                  <div>
                    <dt>Saldo restante</dt>
                    <dd>{money(remaining(record), record.product.currency)}</dd>
                  </div>
                  <div>
                    <dt>Cuotas pagadas</dt>
                    <dd>
                      {record.receipts.length} /{' '}
                      {record.result.schedule.filter((row) => row.payment > 0).length}
                    </dd>
                  </div>
                  <div>
                    <dt>Estado</dt>
                    <dd>
                      {nextPayableIndex(record.result.schedule, record.receipts) < 0
                        ? 'Completado (prueba)'
                        : 'Activo (prueba)'}
                    </dd>
                  </div>
                </dl>
                <button className="primary-button" onClick={() => onOpen(record)}>
                  Ver producto y cronograma →
                </button>
              </article>
            ))}
            {records.length === 0 && (
              <div className="account-empty">
                <p>Aún no tienes financiamientos. Acepta uno desde el catálogo para verlo aquí.</p>
                <button className="primary-button" onClick={onCatalog}>
                  Explorar tiendas
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
