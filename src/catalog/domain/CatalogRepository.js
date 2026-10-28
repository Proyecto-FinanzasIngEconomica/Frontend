export class CatalogRepository {
  async listStores() {
    throw new Error('Implementa listStores en el adaptador.');
  }
  async listProducts(_storeId) {
    throw new Error('Implementa listProducts en el adaptador.');
  }
}
