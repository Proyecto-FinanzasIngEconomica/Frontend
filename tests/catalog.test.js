import test from 'node:test';
import assert from 'node:assert/strict';
import { LocalCatalogRepository } from '../src/catalog/infrastructure/LocalCatalogRepository.js';
import {
  createLoadStores,
  createLoadProducts,
  filterCatalog,
} from '../src/catalog/application/loadCatalog.js';

test('cargar negocios combina registros locales con ejemplos identificados', async () => {
  const repository = new LocalCatalogRepository({
    listLocalStores: () => [{ id: 'local-1', name: 'Mi negocio' }],
  });
  const stores = await createLoadStores(repository)();
  assert.equal(stores[0].demo, false);
  assert.ok(stores[0].description);
  assert.ok(stores[0].imageUrl);
  assert.equal(stores.filter((store) => store.demo).length, 3);
});
test('productos pertenecen exclusivamente a la tienda seleccionada', async () => {
  const repository = new LocalCatalogRepository({ listLocalStores: () => [] });
  const loadProducts = createLoadProducts(repository);
  const products = await loadProducts('demo-tecnologia');
  assert.equal(products.length, 3);
  assert.ok(products.every((product) => product.storeId === 'demo-tecnologia' && product.demo));
  assert.deepEqual(await loadProducts('local-1'), []);
});
test('búsqueda ignora mayúsculas y tildes, y admite resultados vacíos', async () => {
  const stores = await new LocalCatalogRepository({ listLocalStores: () => [] }).listStores();
  assert.equal(filterCatalog(stores, ' TECNOLOGIA ')[0].id, 'demo-tecnologia');
  assert.equal(filterCatalog(stores, 'no existe').length, 0);
  assert.equal(filterCatalog(stores, '').length, 3);
});
