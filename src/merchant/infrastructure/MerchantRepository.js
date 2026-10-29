const SHOPS = 'crediflow.merchant.shops.v1';
const PRODUCTS = 'crediflow.merchant.products.v1';
import { isStoredProductImage } from '../application/productImage.js';
export class MerchantRepository {
  constructor(storage, getSession) {
    this.storage = storage;
    this.getSession = getSession;
  }
  read(key) {
    return JSON.parse(this.storage.getItem(key) || '[]');
  }
  seller() {
    const user = this.getSession()?.user;
    if (!user || user.accountType !== 'SELLER')
      throw new Error('Esta operación requiere una cuenta de vendedor.');
    return user;
  }
  getShop() {
    const user = this.seller();
    return (
      this.read(SHOPS).find((shop) => shop.id === user.id) || {
        id: user.id,
        name: user.businessName || '',
        ruc: user.ruc || '',
        category: 'Negocio local',
        description: '',
        location: '',
        phone: '',
        email: user.email || '',
        imageUrl: '/catalog/grocery-store.svg',
        published: false,
      }
    );
  }
  saveShop(input) {
    const user = this.seller();
    const name = String(input.name || '').trim();
    const ruc = String(input.ruc || '').trim();
    if (!name || name.length > 100 || !/^\d{11}$/.test(ruc))
      throw new Error('Ingresa el nombre de la tienda y un RUC de 11 dígitos.');
    if (!String(input.description || '').trim() || !String(input.location || '').trim())
      throw new Error('Completa la descripción y la dirección de la tienda.');
    if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))
      throw new Error('El correo de contacto no es válido.');
    if (input.phone && !/^\+?[\d\s()-]{7,20}$/.test(input.phone))
      throw new Error('El teléfono de contacto no es válido.');
    const shop = {
      id: user.id,
      name,
      ruc,
      category: String(input.category || 'Negocio local').slice(0, 60),
      description: String(input.description).trim().slice(0, 600),
      location: String(input.location).trim().slice(0, 180),
      phone: String(input.phone || '').slice(0, 20),
      email: String(input.email || '').slice(0, 100),
      imageUrl: '/catalog/grocery-store.svg',
      published: Boolean(input.published),
      updatedAt: new Date().toISOString(),
    };
    const shops = this.read(SHOPS);
    this.storage.setItem(
      SHOPS,
      JSON.stringify([...shops.filter((item) => item.id !== user.id), shop]),
    );
    return shop;
  }
  products() {
    const user = this.seller();
    return this.read(PRODUCTS).filter((item) => item.storeId === user.id);
  }
  saveProduct(input) {
    const user = this.seller();
    const products = this.read(PRODUCTS);
    const existing = input.id ? products.find((item) => item.id === input.id) : null;
    if (input.id && (!existing || existing.storeId !== user.id))
      throw new Error('No puedes modificar este producto.');
    const price = Number(input.cashPrice);
    const stock = Number(input.stock);
    if (
      !String(input.name || '').trim() ||
      !String(input.description || '').trim() ||
      !String(input.category || '').trim()
    )
      throw new Error('Completa nombre, categoría y descripción.');
    if (!Number.isFinite(price) || price <= 0 || price > 100000000)
      throw new Error('Ingresa un precio válido mayor que cero.');
    if (!Number.isInteger(stock) || stock < 0 || stock > 1000000)
      throw new Error('El stock debe ser un número entero entre 0 y 1 000 000.');
    const imageUrl = String(input.imageUrl || '/catalog/groceries.svg');
    if (
      !imageUrl.startsWith('/catalog/') &&
      !/^https:\/\//.test(imageUrl) &&
      !isStoredProductImage(imageUrl)
    )
      throw new Error('Sube una imagen JPG, PNG o WebP válida.');
    const product = {
      id: existing?.id || crypto.randomUUID(),
      storeId: user.id,
      name: String(input.name).trim().slice(0, 120),
      description: String(input.description).trim().slice(0, 600),
      category: String(input.category).trim().slice(0, 60),
      cashPrice: price,
      creditPrice: price,
      currency: 'PEN',
      stock,
      imageUrl,
      installmentsAllowed: Boolean(input.installmentsAllowed),
      endOfMonthAllowed: false,
      active: Boolean(input.active),
      demo: false,
      updatedAt: new Date().toISOString(),
    };
    try {
      this.storage.setItem(
        PRODUCTS,
        JSON.stringify([...products.filter((item) => item.id !== product.id), product]),
      );
    } catch {
      throw new Error(
        'No se pudo guardar el producto. El almacenamiento del navegador puede estar lleno; prueba con una imagen más pequeña.',
      );
    }
    return product;
  }
  publicStores(fallback = []) {
    const saved = this.read(SHOPS);
    return [
      ...saved.filter((shop) => shop.published),
      ...fallback.filter((shop) => !saved.some((item) => item.id === shop.id)),
    ];
  }
  publicProducts(storeId) {
    if (this.read(SHOPS).some((shop) => shop.id === storeId && !shop.published)) return [];
    return this.read(PRODUCTS).filter(
      (item) => item.storeId === storeId && item.active && item.stock > 0,
    );
  }
  financings() {
    const seller = this.seller();
    return this.read('crediflow.local.users.v1').flatMap((user) =>
      this.read(`crediflow.financings.v1.${user.id}`)
        .filter((record) => record.product.storeId === seller.id)
        .map((record) => ({
          ...record,
          customer: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            documentNumber: user.documentNumber,
            phone: user.phone || '',
          },
        })),
    );
  }
}
