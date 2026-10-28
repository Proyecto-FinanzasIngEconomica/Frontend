import { useState } from 'react';

export function MerchantShopForm({ shop, repository, onSaved }) {
  const [values, setValues] = useState(shop);
  const [error, setError] = useState('');
  const update = (event) =>
    setValues((old) => ({
      ...old,
      [event.target.name]:
        event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    }));
  return (
    <form
      className="merchant-panel merchant-form"
      onSubmit={(event) => {
        event.preventDefault();
        try {
          onSaved(repository.saveShop(values));
        } catch (err) {
          setError(err.message);
        }
      }}
    >
      <div className="merchant-panel-heading">
        <h2>{shop.updatedAt ? 'Información de la tienda' : 'Registra tu tienda'}</h2>
        <span className="merchant-badge">{shop.published ? 'Publicada' : 'Borrador'}</span>
      </div>
      <p>Completa los datos del negocio y publícalo para mostrarlo en el catálogo de clientes.</p>
      <div className="merchant-form-grid">
        <label>
          Nombre comercial
          <input name="name" required maxLength={100} value={values.name} onChange={update} />
        </label>
        <label>
          RUC
          <input
            name="ruc"
            required
            inputMode="numeric"
            pattern="[0-9]{11}"
            maxLength={11}
            value={values.ruc}
            onChange={update}
          />
        </label>
        <label>
          Categoría
          <input
            name="category"
            required
            maxLength={60}
            value={values.category}
            onChange={update}
            placeholder="Tecnología, alimentos, hogar…"
          />
        </label>
        <label>
          Dirección / ciudad
          <input
            name="location"
            required
            maxLength={180}
            value={values.location}
            onChange={update}
          />
        </label>
        <label>
          Correo de contacto
          <input name="email" type="email" maxLength={100} value={values.email} onChange={update} />
        </label>
        <label>
          Teléfono
          <input name="phone" type="tel" maxLength={20} value={values.phone} onChange={update} />
        </label>
        <label className="merchant-wide">
          Descripción
          <textarea
            name="description"
            required
            maxLength={600}
            rows={4}
            value={values.description}
            onChange={update}
          />
        </label>
      </div>
      <label className="merchant-check">
        <input name="published" type="checkbox" checked={values.published} onChange={update} />
        Publicar tienda en el catálogo
      </label>
      {error && (
        <p role="alert" className="merchant-error">
          {error}
        </p>
      )}
      <footer>
        <button type="submit" className="primary-button">
          {shop.updatedAt ? 'Guardar cambios' : 'Registrar tienda'}
        </button>
      </footer>
    </form>
  );
}

export function MerchantProductForm({ product, repository, onSaved, onCancel }) {
  const [values, setValues] = useState(
    product || {
      name: '',
      category: '',
      description: '',
      cashPrice: '',
      stock: '1',
      imageUrl: '/catalog/groceries.svg',
      installmentsAllowed: true,
      active: true,
    },
  );
  const [error, setError] = useState('');
  const update = (event) =>
    setValues((old) => ({
      ...old,
      [event.target.name]:
        event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    }));
  return (
    <form
      className="merchant-panel merchant-form"
      onSubmit={(event) => {
        event.preventDefault();
        try {
          onSaved(repository.saveProduct(values));
        } catch (err) {
          setError(err.message);
        }
      }}
    >
      <h2>{product ? 'Editar producto' : 'Registrar producto'}</h2>
      <p>Los productos activos, con stock y de una tienda publicada aparecen en el catálogo.</p>
      <div className="merchant-form-grid">
        <label>
          Nombre
          <input name="name" required maxLength={120} value={values.name} onChange={update} />
        </label>
        <label>
          Categoría
          <input
            name="category"
            required
            maxLength={60}
            value={values.category}
            onChange={update}
          />
        </label>
        <label>
          Precio al contado (PEN)
          <input
            name="cashPrice"
            required
            type="number"
            min="0.01"
            max="100000000"
            step="0.01"
            value={values.cashPrice}
            onChange={update}
          />
        </label>
        <label>
          Stock disponible
          <input
            name="stock"
            required
            type="number"
            min="0"
            max="1000000"
            step="1"
            value={values.stock}
            onChange={update}
          />
        </label>
        <label className="merchant-wide">
          Descripción
          <textarea
            name="description"
            required
            maxLength={600}
            rows={4}
            value={values.description}
            onChange={update}
          />
        </label>
        <label className="merchant-wide">
          Imagen del producto
          <select
            name="imageUrl"
            value={values.imageUrl.startsWith('/catalog/') ? values.imageUrl : 'custom'}
            onChange={(event) =>
              setValues((old) => ({
                ...old,
                imageUrl: event.target.value === 'custom' ? 'https://' : event.target.value,
              }))
            }
          >
            <option value="/catalog/groceries.svg">Abarrotes / general</option>
            <option value="/catalog/laptop.svg">Laptop</option>
            <option value="/catalog/tablet.svg">Tablet</option>
            <option value="custom">Dirección HTTPS personalizada</option>
          </select>
          {!values.imageUrl.startsWith('/catalog/') && (
            <input
              name="imageUrl"
              type="url"
              required
              value={values.imageUrl}
              onChange={update}
              placeholder="https://…"
            />
          )}
        </label>
      </div>
      <div className="merchant-checks">
        <label className="merchant-check">
          <input
            name="installmentsAllowed"
            type="checkbox"
            checked={values.installmentsAllowed}
            onChange={update}
          />
          Permitir financiamiento
        </label>
        <label className="merchant-check">
          <input name="active" type="checkbox" checked={values.active} onChange={update} />
          Producto activo
        </label>
      </div>
      {error && (
        <p role="alert" className="merchant-error">
          {error}
        </p>
      )}
      <footer>
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="primary-button">
          Guardar producto
        </button>
      </footer>
    </form>
  );
}
