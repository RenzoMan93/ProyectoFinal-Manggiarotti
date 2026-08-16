const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Uploads a single image file to Cloudinary (free tier, no card required)
 * using an unsigned upload preset, and returns its public URL.
 * `folder` groups files by purpose (e.g. "products/<uid>", "kyc/<uid>").
 *
 * Setup: create a Cloudinary account, then Settings → Upload → Upload
 * presets → Add upload preset → Signing Mode: "Unsigned". Put the cloud
 * name and preset name in .env.local (VITE_CLOUDINARY_CLOUD_NAME /
 * VITE_CLOUDINARY_UPLOAD_PRESET).
 */
export async function uploadImage(folder, file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary no está configurado — completá VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en .env.local');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'No se pudo subir la imagen a Cloudinary.');
  }

  const data = await response.json();
  return data.secure_url;
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
