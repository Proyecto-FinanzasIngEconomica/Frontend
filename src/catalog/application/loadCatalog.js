export function createLoadStores(repository) {
  return () => repository.listStores();
}
export function createLoadProducts(repository) {
  return (storeId) => repository.listProducts(storeId);
}
export function filterCatalog(items, query) {
  const normalized = (value) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  const term = normalized(query.trim());
  return items.filter((item) =>
    normalized(`${item.name} ${item.description} ${item.category || ''}`).includes(term),
  );
}
