import { CatalogRepository } from '../domain/CatalogRepository.js';
import { demoStores, demoProducts } from './demoCatalog.js';

export class LocalCatalogRepository extends CatalogRepository {
  constructor({ listLocalStores, listLocalProducts = () => [] }) {
    super();
    this.listLocalStores = listLocalStores;
    this.listLocalProducts = listLocalProducts;
  }
  async listStores() {
    return [
      ...this.listLocalStores().map((store) => ({
        ...store,
        category: store.category || 'Negocio local',
        description:
          store.description || 'Conoce este negocio y descubre su catálogo de productos.',
        imageUrl: store.imageUrl || '/catalog/grocery-store.svg',
        location: store.location || 'Registrado en este navegador',
        demo: false,
      })),
      ...demoStores,
    ];
  }
  async listProducts(storeId) {
    return [
      ...this.listLocalProducts(storeId),
      ...demoProducts.filter((item) => item.storeId === storeId),
    ];
  }
}
