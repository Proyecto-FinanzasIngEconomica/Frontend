import test from 'node:test';
import assert from 'node:assert/strict';
import {
  nextPayableIndex,
  recordInstallment,
} from '../src/catalog/application/installmentPayments.js';

test('habilita cuotas sucesivas y acumula el saldo hasta completar el financiamiento', () => {
  const schedule = [{ payment: 100 }, { payment: 120 }, { payment: 80 }];
  const receipts = [];
  for (let index = 0; index < 3; index++) {
    assert.equal(nextPayableIndex(schedule, receipts), index);
    receipts.push(recordInstallment(schedule, receipts, index, { id: String(index) }));
  }
  assert.deepEqual(
    receipts.map((item) => item.remaining),
    [200, 80, 0],
  );
  assert.deepEqual(
    receipts.map((item) => item.installment),
    [1, 2, 3],
  );
  assert.equal(nextPayableIndex(schedule, receipts), -1);
});
test('rechaza pagos duplicados y fuera de orden', () => {
  const schedule = [{ payment: 100 }, { payment: 120 }];
  assert.throws(() => recordInstallment(schedule, [], 1, {}));
  const first = recordInstallment(schedule, [], 0, {});
  assert.throws(() => recordInstallment(schedule, [first], 0, {}));
});
test('omite períodos de gracia sin importe a pagar', () => {
  const schedule = [{ payment: 0 }, { payment: 0 }, { payment: 150 }];
  assert.equal(nextPayableIndex(schedule, []), 2);
  const receipt = recordInstallment(schedule, [], 2, {});
  assert.equal(receipt.installment, 3);
  assert.equal(receipt.remaining, 0);
});
