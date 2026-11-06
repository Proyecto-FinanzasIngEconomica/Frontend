import test from 'node:test';
import assert from 'node:assert/strict';
import {
  imageDimensions,
  validateImageFile,
  isStoredProductImage,
  MAX_UPLOAD_BYTES,
  MAX_STORED_IMAGE_BYTES,
} from '../src/merchant/application/productImage.js';
test('acepta fotos JPG, PNG y WebP y rechaza otros formatos o tamaños', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp'])
    assert.doesNotThrow(() => validateImageFile({ type, size: 1000 }));
  assert.throws(() => validateImageFile({ type: 'image/svg+xml', size: 100 }));
  assert.throws(() => validateImageFile({ type: 'text/plain', size: 100 }));
  assert.throws(() => validateImageFile({ type: 'image/png', size: MAX_UPLOAD_BYTES + 1 }));
  assert.throws(() => validateImageFile({ type: 'image/png', size: 0 }));
});
test('optimiza dimensiones conservando proporciones sin ampliar imágenes pequeñas', () => {
  assert.deepEqual(imageDimensions(4000, 2000), { width: 1000, height: 500 });
  assert.deepEqual(imageDimensions(2000, 4000), { width: 500, height: 1000 });
  assert.deepEqual(imageDimensions(300, 200), { width: 300, height: 200 });
  assert.throws(() => imageDimensions(0, 20));
});
test('solo permite datos de imagen raster de tamaño limitado', () => {
  assert.equal(isStoredProductImage('data:image/jpeg;base64,/9j/AAAA'), true);
  assert.equal(isStoredProductImage('data:image/svg+xml;base64,AAAA'), false);
  assert.equal(isStoredProductImage('data:text/html;base64,AAAA'), false);
  assert.equal(isStoredProductImage('data:image/jpeg;base64,invalid!'), false);
  assert.equal(
    isStoredProductImage('data:image/jpeg;base64,' + 'A'.repeat(MAX_STORED_IMAGE_BYTES * 2)),
    false,
  );
});
