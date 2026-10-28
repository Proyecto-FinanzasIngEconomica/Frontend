import { CatalogRepository } from '../domain/CatalogRepository.js';
import { demoStores, demoProducts } from './demoCatalog.js';

export class LocalCatalogRepository extends CatalogRepository {
  constructor({ listLocalStores }) {
    super();
    this.listLocalStores = listLocalStores;
  }
  async listStores() {
    return [
      ...this.listLocalStores().map((store) => ({
        ...store,
        category: 'Negocio local',
        description:
          store.description || 'Conoce este negocio y descubre su catálogo de productos.',
        imageUrl: store.imageUrl || '/catalog/grocery-store.svg',
        location: 'Registrado en este navegador',
        demo: false,
      })),
      ...demoStores,
    ];
  }
  async listProducts(storeId) {
    return demoProducts.filter((item) => item.storeId === storeId);
  }
}
