import test from 'node:test';
import assert from 'node:assert/strict';
import {
  saveCardReference,
  readCardReferences,
  removeCardReference,
} from '../src/catalog/infrastructure/SavedCardRepository.js';

function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}
test('guarda solo la referencia sin número completo, CVV ni titular', () => {
  const db = storage();
  saveCardReference(db, 'alice', {
    id: 'one',
    alias: 'Personal',
    brand: 'Visa',
    last4: '4242',
    number: '4242424242424242',
    cvv: '123',
    holder: 'Titular',
    expiry: '12/30',
  });
  assert.deepEqual(readCardReferences(db, 'alice'), [
    { id: 'one', alias: 'Personal', brand: 'Visa', last4: '4242' },
  ]);
});
test('aísla tarjetas por cuenta y elimina solo la referencia elegida', () => {
  const db = storage();
  const card = { id: 'one', alias: 'Personal', brand: 'Visa', last4: '4242' };
  saveCardReference(db, 'alice', card);
  saveCardReference(db, 'bob', card);
  removeCardReference(db, 'alice', 'one');
  assert.equal(readCardReferences(db, 'alice').length, 0);
  assert.equal(readCardReferences(db, 'bob').length, 1);
  assert.equal(readCardReferences(db, 'charlie').length, 0);
});
test('impide guardar sin cuenta o con número completo en last4', () => {
  const db = storage();
  assert.throws(() => saveCardReference(db, null, { last4: '4242' }));
  assert.throws(() => saveCardReference(db, 'alice', { last4: '4242424242424242' }));
});
