/** Redimensiona y comprime una imagen en el navegador y devuelve un data URL base64.
 *  Se guarda directo en Firestore (sin Firebase Storage), por eso el tamaño
 *  y la calidad se mantienen bajos para no superar el límite de 1MB por documento.
 */
export function comprimirImagen(file, maxSize = 800, calidad = 0.6) {
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
