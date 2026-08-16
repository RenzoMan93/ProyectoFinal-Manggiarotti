import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Uploads a single image file to Firebase Storage and returns its public download URL.
 * `folder` groups files by purpose (e.g. "products/<uid>", "kyc/<uid>").
 */
export async function uploadImage(folder, file) {
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const fileRef = ref(storage, `${folder}/${safeName}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

/**
 * Very small client-side quality gate before a photo is even uploaded/considered
 * "approved" in the publish flow. This stands in for a real moderation pipeline
 * (see functions/index.js reviewProductPhoto for where a vision API would plug in):
 * it only checks resolution and file size, not actual content or damage.
 */
export function checkImageQuality(file) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve({ ok: false, reason: 'El archivo no es una imagen.' });
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      resolve({ ok: false, reason: 'La imagen pesa demasiado (máx. 12MB).' });
      return;
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (img.width < 400 || img.height < 400) {
        resolve({ ok: false, reason: 'Foto borrosa o de muy baja resolución — subí una más nítida.' });
      } else {
        resolve({ ok: true });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ ok: false, reason: 'No se pudo leer la imagen.' });
    };
    img.src = objectUrl;
  });
}
