import { Icon } from '../../shared/presentation/Icon.jsx';
import './financing-result.css';

export function paymentDate(base, offset) {
  const [year, month, day] = base.split('-').map(Number);
  const last = new Date(Date.UTC(year, month - 1 + offset + 1, 0)).getUTCDate();
  return new Intl.DateTimeFormat('es-PE', { timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1 + offset, Math.min(day, last))),
  );
}

export function FinancingSchedule({
  result,
  product,
  baseDate,
  highlightFirst = false,
  paidInstallments = [],
}) {
  const money = (value) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: product.currency }).format(value);
  const interestSum = result.schedule.reduce((sum, row) => sum + row.interest, 0);
  const amortizedSum = result.schedule.reduce((sum, row) => sum + row.amortization, 0);
  return (
    <section className="financing-outcome-panel financing-schedule">
      <header>
        <div>
          <h2>
            <Icon name="calendar" size={19} />
            Cronograma de pagos
          </h2>
          <p>Detalle de intereses, amortización y saldo por período.</p>
        </div>
        <small>{result.periods} cuotas programadas</small>
      </header>
      <div
        className="financing-table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Cronograma de pagos con desplazamiento horizontal"
      >
        <table>
          <thead>
            <tr>
              {[
                'N°',
                'Fecha estimada',
                'Saldo inicial',
                'Interés',
                'Amortización',
                'Cuota',
                'Saldo final',
                'Estado',
              ].map((title) => (
                <th key={title} scope="col">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.schedule.map((row, index) => (
              <tr
                key={index}
                className={highlightFirst && index === 0 ? 'installment-first' : undefined}
              >
                <td>{index + 1}</td>
                <td>{paymentDate(baseDate, (index + 1) * result.interval)}</td>
                <td>{money(row.opening)}</td>
                <td>{money(row.interest)}</td>
                <td>{money(row.amortization)}</td>
                <td className={index === 0 ? 'blue' : ''}>{money(row.payment)}</td>
                <td>{money(Math.max(0, row.closing))}</td>
                <td>
                  <span className={`financing-row-status ${row.grace ? 'grace' : ''}`}>
                    {paidInstallments.includes(index + 1)
                      ? 'Pagado (prueba)'
                      : row.grace
                        ? 'Gracia'
                        : 'Simulado'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={3} scope="row">
                Totales amortizados
              </th>
              <td>{money(interestSum)}</td>
              <td>{money(amortizedSum)}</td>
              <td className="blue">{money(result.total)}</td>
              <td>{money(0)}</td>
              <td>Saldo final</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
