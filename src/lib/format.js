import { CATEGORIES } from "@/lib/constants";

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

const CONDITION_BADGES = {
  Nuevo: "Nuevo",
  "Usado - buen estado": "Buen estado",
  "Usado - regular estado": "Estado regular",
};

export function conditionBadge(condition) {
  return CONDITION_BADGES[condition] || condition;
}

export function formatPrice(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return n;
  return "$U " + num.toLocaleString("es-UY");
}

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `hace ${hr} h`;
  const d = Math.floor(hr / 24);
  return `hace ${d} d`;
}
