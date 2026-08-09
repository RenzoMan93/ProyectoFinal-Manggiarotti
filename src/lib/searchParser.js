// Interpreta frases en lenguaje natural tipo "bici que salga menos de $3000"
// sin IA: solo reglas de texto (montos + stopwords en español).

const STOPWORDS = new Set([
  "quiero", "quisiera", "busco", "necesito", "algo", "un", "una", "unos", "unas",
  "que", "salga", "salgan", "cueste", "cuesten", "valga", "valgan", "vale", "valen",
  "de", "por", "para", "el", "la", "los", "las", "con", "y", "o", "del", "al",
  "producto", "productos", "articulo", "articulos", "artículo", "artículos",
  "cerca", "aproximadamente", "alrededor", "tenga", "tengan", "no", "en",
]);

function parseAmount(str) {
  const s = str.trim().replace(/\./g, "").replace(",", ".");
  const n = parseFloat(s);
  return Number.isNaN(n) ? null : n;
}

export function parseSearchQuery(raw) {
  let text = (raw || "").toLowerCase().trim();
  let minPrice = null;
  let maxPrice = null;

  const AMOUNT = "\\$?\\s?([\\d.,]+)\\s*(?:pesos|uyu|\\$)?";

  let m = text.match(new RegExp(`entre\\s+${AMOUNT}\\s+y\\s+${AMOUNT}`));
  if (m) {
    minPrice = parseAmount(m[1]);
    maxPrice = parseAmount(m[2]);
    text = text.replace(m[0], " ");
  } else {
    m = text.match(new RegExp(`(?:menos de|hasta|m[aá]ximo|no m[aá]s de)\\s+${AMOUNT}`));
    if (m) {
      maxPrice = parseAmount(m[1]);
      text = text.replace(m[0], " ");
    }

    m = text.match(new RegExp(`(?:m[aá]s de|desde|m[ií]nimo)\\s+${AMOUNT}`));
    if (m) {
      minPrice = parseAmount(m[1]);
      text = text.replace(m[0], " ");
    }

    if (minPrice === null && maxPrice === null) {
      m = text.match(/\$\s?([\d.,]+)|\b(\d[\d.,]*)\s*(?:pesos|uyu)\b/);
      if (m) {
        maxPrice = parseAmount(m[1] || m[2]);
        text = text.replace(m[0], " ");
      }
    }
  }

  const keywords = text
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .join(" ")
    .trim();

  return { keywords, minPrice, maxPrice };
}
