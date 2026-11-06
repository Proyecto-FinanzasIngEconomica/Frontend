const prefix = 'crediflow.card-references.v1.';
export function saveCardReference(storage, userId, card) {
  if (!userId) throw new Error('Inicia sesión para guardar una tarjeta.');
  if (!/^\d{4}$/.test(card.last4)) throw new Error('Referencia de tarjeta inválida.');
  const reference = {
    id: card.id,
    alias: String(card.alias).slice(0, 60),
    brand: card.brand,
    last4: card.last4,
  };
  const cards = readCardReferences(storage, userId);
  storage.setItem(
    prefix + userId,
    JSON.stringify([...cards.filter((item) => item.id !== reference.id), reference]),
  );
  return reference;
}
export function readCardReferences(storage, userId) {
  if (!userId) return [];
  const items = JSON.parse(storage.getItem(prefix + userId) || '[]');
  return Array.isArray(items) ? items.filter((item) => item && /^\d{4}$/.test(item.last4)) : [];
}
export function removeCardReference(storage, userId, id) {
  storage.setItem(
    prefix + userId,
    JSON.stringify(readCardReferences(storage, userId).filter((item) => item.id !== id)),
  );
}
