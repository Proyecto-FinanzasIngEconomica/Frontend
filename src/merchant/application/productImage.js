export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_STORED_IMAGE_BYTES = 600 * 1024;
const types = ['image/jpeg', 'image/png', 'image/webp'];
export function validateImageFile(file) {
  if (!file || !types.includes(file.type))
    throw new Error('Selecciona una imagen JPG, PNG o WebP.');
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES)
    throw new Error('La imagen debe pesar como máximo 10 MB y no estar vacía.');
}
export function imageDimensions(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
    throw new Error('No se pudo leer el tamaño de la imagen.');
  const scale = Math.min(1, 1000 / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}
export function isStoredProductImage(url) {
  return (
    typeof url === 'string' &&
    url.length <= Math.ceil((MAX_STORED_IMAGE_BYTES * 4) / 3) + 50 &&
    /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(url)
  );
}
export async function prepareProductImage(file) {
  validateImageFile(file);
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
    const dimensions = imageDimensions(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudo preparar la imagen.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL('image/jpeg', 0.8);
    if (!isStoredProductImage(url))
      throw new Error('La imagen es demasiado compleja. Prueba con una de menor tamaño.');
    return url;
  } catch (error) {
    throw new Error(
      error.message?.startsWith('La imagen')
        ? error.message
        : 'No se pudo abrir la imagen. Prueba con otro archivo JPG, PNG o WebP.',
    );
  } finally {
    bitmap?.close();
  }
}
