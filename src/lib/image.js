/** Redimensiona y comprime una imagen en el navegador antes de subirla a Storage.
 * Con enhance=true aplica un realce automático de luz/contraste/color (sin IA:
 * estiramiento de niveles por canal + boost de saturación), útil para fotos de
 * productos. Nunca se usa en documentos de identidad. */
export function resizeImageToBlob(file, maxDim = 1280, quality = 0.82, enhance = false) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round(height * (maxDim / width));
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round(width * (maxDim / height));
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        if (enhance) {
          const imageData = ctx.getImageData(0, 0, width, height);
          enhanceImageData(imageData);
          ctx.putImageData(imageData, 0, 0);
        }

        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("No se pudo procesar la imagen"))), "image/jpeg", quality);
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Estiramiento de niveles por canal (recorta 1% de outliers en cada punta)
 * más un leve boost de saturación. Es procesamiento de imagen clásico
 * (equivalente a "auto contraste"), no analiza el contenido de la foto. */
function enhanceImageData(imageData, saturationBoost = 1.12, clipPercent = 0.01) {
  const { data } = imageData;
  const pixelCount = data.length / 4;
  const clipCount = Math.floor(pixelCount * clipPercent);

  const rHist = new Uint32Array(256);
  const gHist = new Uint32Array(256);
  const bHist = new Uint32Array(256);
  for (let i = 0; i < data.length; i += 4) {
    rHist[data[i]]++;
    gHist[data[i + 1]]++;
    bHist[data[i + 2]]++;
  }

  const bounds = (hist) => {
    let lo = 0;
    let hi = 255;
    let count = 0;
    for (let v = 0; v < 256; v++) {
      count += hist[v];
      if (count > clipCount) {
        lo = v;
        break;
      }
    }
    count = 0;
    for (let v = 255; v >= 0; v--) {
      count += hist[v];
      if (count > clipCount) {
        hi = v;
        break;
      }
    }
    return hi > lo ? [lo, hi] : [0, 255];
  };

  const [rLo, rHi] = bounds(rHist);
  const [gLo, gHi] = bounds(gHist);
  const [bLo, bHi] = bounds(bHist);

  const stretch = (v, lo, hi) => {
    const t = ((v - lo) / (hi - lo)) * 255;
    return t < 0 ? 0 : t > 255 ? 255 : t;
  };

  for (let i = 0; i < data.length; i += 4) {
    let r = stretch(data[i], rLo, rHi);
    let g = stretch(data[i + 1], gLo, gHi);
    let b = stretch(data[i + 2], bLo, bHi);

    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = gray + (r - gray) * saturationBoost;
    g = gray + (g - gray) * saturationBoost;
    b = gray + (b - gray) * saturationBoost;

    data[i] = r < 0 ? 0 : r > 255 ? 255 : r;
    data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
    data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
  }

  return imageData;
}
