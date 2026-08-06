export function waLink(phone, title) {
  const digits = String(phone).replace(/\D/g, "");
  const withCode = digits.startsWith("598") ? digits : `598${digits.replace(/^0+/, "")}`;
  const msg = encodeURIComponent(`Hola! Vi tu publicación "${title}" en ReUsalo y me interesa.`);
  return `https://wa.me/${withCode}?text=${msg}`;
}
