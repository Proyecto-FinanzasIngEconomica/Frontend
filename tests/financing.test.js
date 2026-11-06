import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFinancing } from '../src/catalog/application/calculateFinancing.js';

const base = {
  principal: 2400,
  annualRate: 0,
  rateType: 'effective',
  months: 12,
  frequency: 'monthly',
  amortization: 'french',
  grace: 'none',
  gracePeriods: 0,
};
test('sin intereses, las cuotas restituyen exactamente el capital', () => {
  const result = calculateFinancing(base);
  assert.equal(result.payment, 200);
  assert.equal(result.total, 2400);
});
test('cronograma concilia capital, intereses, cuotas y saldo incluso con gracia total', () => {
  for (const grace of ['none', 'partial', 'total']) {
    const result = calculateFinancing({
      ...base,
      annualRate: 18,
      grace,
      gracePeriods: grace === 'none' ? 0 : 2,
    });
    assert.equal(result.schedule.length, 12);
    let previous = base.principal;
    for (const row of result.schedule) {
      assert.ok(Math.abs(row.opening - previous) < 1e-8);
      assert.ok(Math.abs(row.opening + row.interest - row.payment - row.closing) < 1e-8);
      previous = row.closing;
    }
    assert.ok(Math.abs(previous) < 1e-8);
    assert.ok(
      Math.abs(result.schedule.reduce((sum, row) => sum + row.amortization, 0) - base.principal) <
        1e-8,
    );
    assert.ok(
      Math.abs(result.schedule.reduce((sum, row) => sum + row.interest, 0) - result.interest) <
        1e-8,
    );
  }
});
test('tasa efectiva anual conserva la equivalencia de un año', () => {
  const result = calculateFinancing({ ...base, months: 1, annualRate: 18 });
  const rate = result.payment / 2400 - 1;
  assert.ok(Math.abs((1 + rate) ** 12 - 1.18) < 1e-10);
});
test('gracia total capitaliza intereses y gracia parcial los paga', () => {
  const partial = calculateFinancing({
    ...base,
    annualRate: 12,
    rateType: 'nominal',
    months: 2,
    grace: 'partial',
    gracePeriods: 1,
  });
  const total = calculateFinancing({
    ...base,
    annualRate: 12,
    rateType: 'nominal',
    months: 2,
    grace: 'total',
    gracePeriods: 1,
  });
  assert.ok(Math.abs(partial.total - 2448) < 1e-8);
  assert.ok(Math.abs(total.total - 2448.24) < 1e-8);
});
test('amortización alemana reduce las cuotas sucesivas', () => {
  const result = calculateFinancing({
    ...base,
    annualRate: 12,
    rateType: 'nominal',
    amortization: 'german',
  });
  assert.equal(result.payment, 224);
  assert.equal(result.lastPayment, 202);
  assert.equal(result.total, 2556);
});
test('rechaza plazos incompatibles y gracia que ocupa todo el plazo', () => {
  assert.throws(() => calculateFinancing({ ...base, months: 5, frequency: 'quarterly' }));
  assert.throws(() => calculateFinancing({ ...base, grace: 'total', gracePeriods: 12 }));
});
