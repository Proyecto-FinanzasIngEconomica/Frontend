import test from 'node:test';
import assert from 'node:assert/strict';
import { MerchantRepository } from '../src/merchant/infrastructure/MerchantRepository.js';
import { FinancingRepository } from '../src/catalog/infrastructure/FinancingRepository.js';
import { LocalCatalogRepository } from '../src/catalog/infrastructure/LocalCatalogRepository.js';
function setup() {
  const data = new Map();
  const storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
  const seller = {
    id: 'shop-one',
    accountType: 'SELLER',
    businessName: 'Conecta',
    ruc: '20123456789',
    email: 'shop@example.test',
  };
  return { storage, seller, repo: new MerchantRepository(storage, () => ({ user: seller })) };
}
const product = {
  name: 'Laptop',
  category: 'Tecnología',
  description: 'Equipo portátil',
  cashPrice: 2400,
  stock: 4,
  active: true,
  installmentsAllowed: true,
  imageUrl: '/catalog/laptop.svg',
};
const shopData = {
  name: 'Conecta',
  ruc: '20123456789',
  category: 'Tecnología',
  description: 'Equipos para estudiar',
  location: 'Lima',
  published: true,
};
test('registra y edita tienda, publicación e integración con el catálogo', async () => {
  const { repo } = setup();
  assert.equal(repo.getShop().name, 'Conecta');
  repo.saveShop(shopData);
  repo.saveProduct(product);
  const catalog = new LocalCatalogRepository({
    listLocalStores: () => repo.publicStores(),
    listLocalProducts: (id) => repo.publicProducts(id),
  });
  const store = (await catalog.listStores()).find((item) => item.id === 'shop-one');
  assert.equal(store.category, 'Tecnología');
  assert.equal(store.location, 'Lima');
  assert.equal((await catalog.listProducts('shop-one'))[0].name, 'Laptop');
  repo.saveShop({ ...shopData, published: false });
  assert.equal(repo.publicStores([{ id: 'shop-one', name: 'Anterior' }]).length, 0);
  assert.equal((await catalog.listProducts('shop-one')).length, 0);
});
test('solo publica productos activos y con stock; rechaza datos inválidos', () => {
  const { repo } = setup();
  repo.saveShop(shopData);
  const item = repo.saveProduct(product);
  assert.equal(repo.publicProducts('shop-one').length, 1);
  repo.saveProduct({ ...item, stock: 0 });
  assert.equal(repo.publicProducts('shop-one').length, 0);
  repo.saveProduct({ ...item, active: false });
  assert.equal(repo.publicProducts('shop-one').length, 0);
  assert.throws(() => repo.saveProduct({ ...product, cashPrice: -1 }));
  assert.throws(() => repo.saveProduct({ ...product, stock: 0.5 }));
  assert.throws(() => repo.saveProduct({ ...product, imageUrl: 'javascript:alert(1)' }));
  assert.throws(() => repo.saveShop({ ...shopData, ruc: '123' }));
});
test('una foto subida persiste y se conserva al editar el producto y cargar el catálogo', () => {
  const { repo, storage, seller } = setup();
  repo.saveShop(shopData);
  const imageUrl = 'data:image/jpeg;base64,/9j/AAAA';
  const saved = repo.saveProduct({ ...product, imageUrl });
  const reloaded = new MerchantRepository(storage, () => ({ user: seller }));
  assert.equal(reloaded.products()[0].imageUrl, imageUrl);
  reloaded.saveProduct({ ...saved, name: 'Laptop actualizada' });
  assert.equal(reloaded.publicProducts(seller.id)[0].imageUrl, imageUrl);
  assert.throws(() => repo.saveProduct({ ...product, imageUrl: 'data:image/svg+xml;base64,AAAA' }));
});
test('un vendedor no puede modificar los productos de otra tienda y un cliente no puede administrarlos', () => {
  const { repo, storage } = setup();
  const item = repo.saveProduct(product);
  const other = new MerchantRepository(storage, () => ({
    user: { id: 'shop-two', accountType: 'SELLER' },
  }));
  assert.equal(other.products().length, 0);
  assert.throws(() => other.saveProduct({ ...item, name: 'Cambio ajeno' }));
  const client = new MerchantRepository(storage, () => ({
    user: { id: 'client', accountType: 'CLIENT' },
  }));
  assert.throws(() => client.saveShop(shopData));
  assert.throws(() => client.saveProduct(product));
  assert.throws(() => client.financings());
});
test('muestra solo clientes, financiamientos y pagos correspondientes a la tienda sin exponer credenciales', () => {
  const { storage, repo } = setup();
  storage.setItem(
    'crediflow.local.users.v1',
    JSON.stringify([
      {
        id: 'client',
        fullName: 'Ana',
        email: 'ana@example.test',
        documentNumber: '12345678',
        passwordHash: 'secret',
        salt: 'secret',
      },
    ]),
  );
  const ledger = new FinancingRepository(storage, 'client');
  const item = repo.saveProduct(product);
  const result = { total: 2400, schedule: [{ payment: 1200 }, { payment: 1200 }] };
  ledger.accept({ id: 'one', product: item, result, values: {}, baseDate: '2026-10-28' });
  ledger.accept({
    id: 'other',
    product: { ...item, storeId: 'shop-two' },
    result,
    values: {},
    baseDate: '2026-10-28',
  });
  ledger.pay('one', 0, { id: 'receipt', createdAt: '2026-10-28T12:00:00Z' });
  repo.saveProduct({ ...item, cashPrice: 3000 });
  const records = repo.financings();
  assert.equal(records.length, 1);
  assert.equal(records[0].receipts[0].amount, 1200);
  assert.equal(records[0].product.cashPrice, 2400);
  assert.equal(records[0].customer.passwordHash, undefined);
  assert.equal(records[0].customer.salt, undefined);
});
