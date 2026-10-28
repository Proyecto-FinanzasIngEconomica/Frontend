import test from 'node:test';
import assert from 'node:assert/strict';
import { FinancingRepository } from '../src/catalog/infrastructure/FinancingRepository.js';
function storage() {
  const data = new Map();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}
const record = {
  id: 'loan',
  product: { name: 'Laptop', cashPrice: 200, currency: 'PEN' },
  values: { term: 2 },
  baseDate: '2026-10-28',
  result: { total: 220, schedule: [{ payment: 110 }, { payment: 110 }] },
};
test('financiamiento aceptado persiste y no se duplica al confirmar de nuevo', () => {
  const db = storage();
  const repo = new FinancingRepository(db, 'alice');
  repo.accept(record);
  repo.accept(record);
  const reloaded = new FinancingRepository(db, 'alice').list();
  assert.equal(reloaded.length, 1);
  assert.deepEqual(reloaded[0].product, record.product);
  assert.deepEqual(reloaded[0].result.schedule, record.result.schedule);
});
test('recupera pagos entre accesos y permite pagar la siguiente cuota', () => {
  const db = storage();
  new FinancingRepository(db, 'alice').accept(record);
  new FinancingRepository(db, 'alice').pay('loan', 0, { id: 'receipt-1' });
  const repo = new FinancingRepository(db, 'alice');
  assert.equal(repo.list()[0].receipts[0].remaining, 110);
  assert.throws(() => repo.pay('loan', 0, {}));
  repo.pay('loan', 1, { id: 'receipt-2' });
  assert.equal(repo.list()[0].receipts.length, 2);
  assert.equal(repo.list()[0].receipts[1].remaining, 0);
});
test('separa financiamientos y pagos por usuario', () => {
  const db = storage();
  new FinancingRepository(db, 'alice').accept(record);
  const other = new FinancingRepository(db, 'bob');
  assert.deepEqual(other.list(), []);
  assert.throws(() => other.pay('loan', 0, {}));
  assert.throws(() => new FinancingRepository(db, null));
});
