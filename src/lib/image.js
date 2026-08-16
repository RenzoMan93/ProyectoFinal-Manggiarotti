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

/** Puntaje de calidad para elegir automáticamente la mejor foto de portada:
 * combina nitidez (varianza del laplaciano, un detector de bordes clásico —
 * a más textura/foco, más varianza) con qué tan centrada está la exposición
 * (penaliza fotos muy oscuras, muy quemadas, o con muchos píxeles al límite).
 * Es un cálculo matemático sobre los píxeles, no analiza qué hay en la foto
 * — no es IA. */
export function scoreImageQuality(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 200;
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
        const { data } = ctx.getImageData(0, 0, width, height);

        const gray = new Float32Array(width * height);
        let sum = 0;
        let clipped = 0;
        for (let i = 0, p = 0; i < data.length; i += 4, p++) {
          const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          gray[p] = g;
          sum += g;
          if (g < 12 || g > 245) clipped++;
        }
        const mean = sum / gray.length;

        let lapSum = 0;
        let lapSumSq = 0;
        let count = 0;
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            const lap = gray[idx - width] + gray[idx + width] + gray[idx - 1] + gray[idx + 1] - 4 * gray[idx];
            lapSum += lap;
            lapSumSq += lap * lap;
            count++;
          }
        }
        const lapMean = count > 0 ? lapSum / count : 0;
        const sharpness = count > 0 ? lapSumSq / count - lapMean * lapMean : 0;

        const exposurePenalty = Math.abs(mean - 130) / 130 + (clipped / gray.length) * 2;
        const exposureFactor = Math.max(0.15, 1 - exposurePenalty);

        resolve(sharpness * exposureFactor);
      };
      img.onerror = () => resolve(0);
      img.src = reader.result;
    };
    reader.onerror = () => resolve(0);
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
