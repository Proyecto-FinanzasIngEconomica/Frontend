import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../shared/presentation/Icon.jsx';
import { calculateFinancing } from '../application/calculateFinancing.js';
import './financing.css';
import { FinancingResultPage } from './FinancingResultPage.jsx';

export function FinancingPage({ product, onBack, onCatalog, customerName }) {
  const heading = useRef(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  const [values, setValues] = useState({
    rateType: 'effective',
    annualRate: '18',
    term: '12',
    unit: 'months',
    frequency: 'monthly',
    amortization: 'french',
    grace: 'none',
    gracePeriods: '0',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const money = (amount) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: product.currency }).format(
      amount,
    );
  function update(event) {
    const { name, value } = event.target;
    setValues((previous) => ({
      ...previous,
      [name]: value,
      ...(name === 'grace' ? { gracePeriods: value === 'none' ? '0' : '1' } : {}),
    }));
    setResult(null);
    setError('');
  }
  function calculate(event) {
    event.preventDefault();
    try {
      setResult(
        calculateFinancing({
          ...values,
          principal: product.cashPrice,
          annualRate: Number(values.annualRate),
          months: Number(values.term) * (values.unit === 'years' ? 12 : 1),
          gracePeriods: Number(values.gracePeriods),
        }),
      );
      setError('');
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  }
  const select = (name, label, options) => (
    <label className="financing-field">
      <span>{label}</span>
      <select name={name} value={values[name]} onChange={update}>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
  if (result)
    return (
      <FinancingResultPage
        product={product}
        values={values}
        result={result}
        onModify={() => {
          setResult(null);
          window.scrollTo(0, 0);
          requestAnimationFrame(() => heading.current?.focus());
        }}
      />
    );
  return (
    <section className="financing-page" aria-labelledby="financing-heading">
      <nav className="purchase-breadcrumb" aria-label="Ruta de compra">
        <button onClick={onCatalog}>Catálogo de Productos</button>
        <span>›</span>
        <strong aria-current="page">Configurar financiamiento</strong>
      </nav>
      <h1 ref={heading} tabIndex={-1} id="financing-heading">
        Configurar financiamiento
      </h1>
      <p className="financing-intro">
        Simula y personaliza las condiciones de amortización para tu compra.
      </p>
      <div className="financing-product">
        <span className="financing-product-icon">
          <img src={product.imageUrl} alt="" />
        </span>
        <div>
          <small>PRODUCTO</small>
          <strong>{product.name}</strong>
        </div>
        <div className="financing-amount">
          <small>MONTO</small>
          <strong>{money(product.cashPrice)}</strong>
        </div>
      </div>
      <form className="financing-form" onSubmit={calculate}>
        <header>
          <h2>
            <Icon name="sliders" size={19} />
            Parámetros de Amortización
          </h2>
          {customerName && <span className="financing-customer">Cliente: {customerName}</span>}
        </header>
        <fieldset>
          <legend>
            <span>1</span>Monto
          </legend>
          <div className="financing-field">
            <span>Monto a financiar ({product.currency})</span>
            <strong>{money(product.cashPrice)}</strong>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <span>2</span>Tasa de Interés
          </legend>
          <div className="financing-columns">
            {select('rateType', 'Tipo de tasa', [
              ['effective', 'Efectiva'],
              ['nominal', 'Nominal'],
            ])}
            <label className="financing-field">
              <span>Tasa de interés (%)</span>
              <div className="financing-input-unit">
                <input
                  required
                  name="annualRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={values.annualRate}
                  onChange={update}
                />
                <span>% anual</span>
              </div>
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <span>3</span>Plazo
          </legend>
          <div className="financing-columns">
            <label className="financing-field">
              <span>Plazo</span>
              <input
                required
                name="term"
                type="number"
                min="1"
                max={values.unit === 'years' ? '30' : '360'}
                step="1"
                value={values.term}
                onChange={update}
              />
            </label>
            {select('unit', 'Unidad', [
              ['months', 'Meses'],
              ['years', 'Años'],
            ])}
          </div>
        </fieldset>
        <div className="financing-columns">
          <fieldset>
            <legend>
              <span>4</span>Pagos
            </legend>
            {select('frequency', 'Frecuencia de pagos', [
              ['monthly', 'Mensual'],
              ['bimonthly', 'Bimestral'],
              ['quarterly', 'Trimestral'],
            ])}
          </fieldset>
          <fieldset>
            <legend>
              <span>5</span>Amortización
            </legend>
            {select('amortization', 'Tipo de amortización', [
              ['french', 'Francesa'],
              ['german', 'Alemana'],
            ])}
          </fieldset>
        </div>
        <fieldset>
          <legend>
            <span>6</span>Período de Gracia
          </legend>
          <div className="financing-columns">
            {select('grace', 'Período de gracia', [
              ['none', 'Sin gracia'],
              ['partial', 'Gracia parcial'],
              ['total', 'Gracia total'],
            ])}
            <label className={`financing-field ${values.grace === 'none' ? 'disabled' : ''}`}>
              <span>Cantidad de períodos de gracia</span>
              <input
                required
                name="gracePeriods"
                type="number"
                min={values.grace === 'none' ? '0' : '1'}
                max="359"
                step="1"
                disabled={values.grace === 'none'}
                value={values.gracePeriods}
                onChange={update}
              />
              <small>
                {values.grace === 'none'
                  ? 'Habilita gracia parcial o total para configurar períodos'
                  : values.grace === 'partial'
                    ? 'Durante la gracia se pagan solo intereses'
                    : 'Los intereses se incorporan al capital durante la gracia'}
              </small>
            </label>
          </div>
        </fieldset>
        {error && (
          <p className="financing-error" role="alert">
            {error}
          </p>
        )}
        <footer>
          <button type="button" className="secondary-button" onClick={onBack}>
            Cancelar
          </button>
          <button type="submit" className="primary-button">
            <Icon name="calendar" size={17} />
            Calcular financiamiento
          </button>
        </footer>
      </form>
    </section>
  );
}
