import { useEffect, useRef, useState } from 'react';
import { prepareProductImage } from '../application/productImage.js';

export function ProductImageUpload({ value, onChange, onBusy }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [filename, setFilename] = useState('');
  const request = useRef(0);
  const input = useRef(null);
  useEffect(
    () => () => {
      request.current += 1;
    },
    [],
  );
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const id = ++request.current;
    setBusy(true);
    onBusy(true);
    setError('');
    try {
      const url = await prepareProductImage(file);
      if (id === request.current) {
        onChange(url);
        setFilename(file.name);
      }
    } catch (err) {
      if (id === request.current) setError(err.message);
    } finally {
      if (id === request.current) {
        setBusy(false);
        onBusy(false);
        if (input.current) input.current.value = '';
      }
    }
  }
  const hasPhoto = value && value !== '/catalog/groceries.svg';
  return (
    <div className="merchant-wide merchant-image-upload">
      <label htmlFor="product-image-file">Imagen del producto</label>
      <div className="merchant-image-upload-body">
        <div className="merchant-image-preview">
          <img
            src={value || '/catalog/groceries.svg'}
            alt="Vista previa del producto"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = '/catalog/groceries.svg';
            }}
          />
        </div>
        <div>
          <p>Sube una foto desde tu equipo</p>
          <input
            ref={input}
            id="product-image-file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={upload}
            disabled={busy}
            aria-describedby="product-image-help"
          />
          <small id="product-image-help">
            JPG, PNG o WebP · Hasta 10 MB. Se optimiza antes de guardar.
          </small>
          {filename && <small className="merchant-image-filename">{filename}</small>}
          {hasPhoto && (
            <button
              type="button"
              className="text-button"
              disabled={busy}
              onClick={() => {
                onChange('/catalog/groceries.svg');
                setFilename('');
                setError('');
              }}
            >
              Quitar imagen
            </button>
          )}
        </div>
      </div>
      {busy && <p role="status">Preparando imagen…</p>}
      {error && (
        <p className="merchant-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
