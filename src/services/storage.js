import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { storage } from '../firebase/config';

/** Redimensiona y comprime una imagen en el navegador antes de subirla. */
export function comprimirImagen(file, maxSize = 1000, calidad = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = img.width * escala;
        canvas.height = img.height * escala;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', calidad));
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function subirImagen(file, ruta) {
  const dataUrl = await comprimirImagen(file);
  const storageRef = ref(storage, ruta);
  await uploadString(storageRef, dataUrl, 'data_url');
  return getDownloadURL(storageRef);
}
