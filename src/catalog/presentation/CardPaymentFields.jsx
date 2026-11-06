import { useEffect, useState } from 'react';
import { identity } from '../../app/dependencies.js';
import {
  readCardReferences,
  saveCardReference,
  removeCardReference,
} from '../infrastructure/SavedCardRepository.js';
import './card-payment.css';

export function CardPaymentFields({ onCardChange }) {
  const [userId] = useState(() => identity.getSession()?.user?.id);
  const [cards, setCards] = useState(() => {
    try {
      return readCardReferences(window.localStorage, userId);
    } catch {
      return [];
    }
  });
  const [selected, setSelected] = useState('new');
  const [remember, setRemember] = useState(true);
  const [message, setMessage] = useState('');
  const [fields, setFields] = useState({ holder: '', number: '', expiry: '', cvv: '', alias: '' });
  useEffect(() => {
    const saved = cards.find((card) => card.id === selected);
    onCardChange?.({
      last4: saved?.last4 || fields.number.replace(/\D/g, '').slice(-4),
      brand: saved?.brand || 'Tarjeta',
    });
  }, [selected, cards, fields.number, onCardChange]);
  function update(event) {
    let value = event.target.value;
    if (event.target.name === 'number')
      value = value
        .replace(/\D/g, '')
        .slice(0, 19)
        .replace(/(.{4})/g, '$1 ')
        .trim();
    if (event.target.name === 'cvv') value = value.replace(/\D/g, '').slice(0, 4);
    if (event.target.name === 'expiry') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    }
    setFields((previous) => ({ ...previous, [event.target.name]: value }));
    setMessage('');
  }
  function save(event) {
    const container = event.currentTarget.closest('fieldset');
    for (const input of container.querySelectorAll('input')) {
      if (!input.reportValidity()) return;
    }
    const digits = fields.number.replace(/\D/g, '');
    let sum = 0;
    let double = false;
    for (let index = digits.length - 1; index >= 0; index--) {
      let n = Number(digits[index]);
      if (double) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      double = !double;
    }
    if (digits.length < 13 || /^([0-9])\1+$/.test(digits) || sum % 10 !== 0) {
      setMessage('Revisa el número de tarjeta.');
      return;
    }
    const [month, year] = fields.expiry.split('/').map(Number);
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
    }).format(new Date());
    if (
      month < 1 ||
      month > 12 ||
      `${2000 + year}-${String(month).padStart(2, '0')}` < today.slice(0, 7)
    ) {
      setMessage('La fecha de vencimiento no es válida.');
      return;
    }
    if (!remember) {
      setMessage('Datos revisados para esta sesión. El cobro requiere conectar una pasarela.');
      return;
    }
    try {
      const brand = /^4/.test(digits)
        ? 'Visa'
        : /^(5[1-5]|2[2-7])/.test(digits)
          ? 'Mastercard'
          : /^3[47]/.test(digits)
            ? 'American Express'
            : 'Tarjeta';
      const card = saveCardReference(window.localStorage, userId, {
        id: crypto.randomUUID(),
        alias: fields.alias.trim() || 'Mi tarjeta',
        brand,
        last4: digits.slice(-4),
      });
      setCards(readCardReferences(window.localStorage, userId));
      setSelected(card.id);
      setFields({ holder: '', number: '', expiry: '', cvv: '', alias: '' });
      setMessage(
        'Referencia guardada para próximos pagos en este navegador. El número completo y el CVV se han descartado.',
      );
    } catch {
      setMessage(
        'No se pudo guardar la referencia. Revisa tu sesión y el almacenamiento del navegador.',
      );
    }
  }
  return (
    <fieldset className="card-payment-fields">
      <legend>Tarjeta de crédito o débito</legend>
      <p className="card-payment-note">
        Formulario de prueba. Usa datos de prueba. Se recuerda solo la referencia de la tarjeta; los
        cobros requieren una pasarela de pagos.
      </p>
      {cards.length > 0 && (
        <label>
          Tarjeta para este pago
          <select
            value={selected}
            onChange={(event) => {
              setSelected(event.target.value);
              setFields({ holder: '', number: '', expiry: '', cvv: '', alias: '' });
              setMessage('');
            }}
          >
            <option value="new">Agregar una tarjeta</option>
            {cards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.alias} · {card.brand} •••• {card.last4}
              </option>
            ))}
          </select>
        </label>
      )}
      {selected === 'new' ? (
        <>
          <div className="card-payment-grid">
            <label className="card-full">
              Nombre del titular
              <input
                name="holder"
                autoComplete="cc-name"
                required
                value={fields.holder}
                maxLength={80}
                onChange={update}
                placeholder="Como aparece en la tarjeta"
              />
            </label>
            <label className="card-full">
              Número de tarjeta
              <input
                name="number"
                autoComplete="off"
                inputMode="numeric"
                required
                minLength={15}
                maxLength={23}
                value={fields.number}
                onChange={update}
                placeholder="0000 0000 0000 0000"
              />
            </label>
            <label>
              Vencimiento
              <input
                name="expiry"
                autoComplete="off"
                inputMode="numeric"
                required
                pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                value={fields.expiry}
                onChange={update}
                placeholder="MM/AA"
                maxLength={5}
              />
            </label>
            <label>
              Código de seguridad (CVV)
              <input
                name="cvv"
                type="password"
                autoComplete="off"
                inputMode="numeric"
                required
                pattern="[0-9]{3,4}"
                maxLength={4}
                value={fields.cvv}
                onChange={update}
                placeholder="•••"
              />
            </label>
            <label className="card-full">
              Alias de la tarjeta (opcional)
              <input
                name="alias"
                autoComplete="off"
                maxLength={60}
                value={fields.alias}
                onChange={update}
                placeholder="Mi tarjeta personal"
              />
            </label>
          </div>
          <label className="card-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Recordar referencia para próximos pagos en este navegador
          </label>
          <button type="button" className="secondary-button" onClick={save}>
            {remember ? 'Guardar referencia de tarjeta' : 'Revisar tarjeta'}
          </button>
        </>
      ) : (
        <div className="card-saved">
          <p>
            Tarjeta seleccionada: {cards.find((card) => card.id === selected)?.brand} ••••{' '}
            {cards.find((card) => card.id === selected)?.last4}
          </p>
          <small>Referencia local guardada. Aún no está habilitada para cobros.</small>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              try {
                removeCardReference(window.localStorage, userId, selected);
                setCards(readCardReferences(window.localStorage, userId));
                setSelected('new');
                setMessage('Referencia eliminada.');
              } catch {
                setMessage('No se pudo eliminar la referencia.');
              }
            }}
          >
            Eliminar tarjeta guardada
          </button>
        </div>
      )}
      {message && (
        <p className="card-payment-message" role="status">
          {message}
        </p>
      )}
    </fieldset>
  );
}
