/**
 * Mock payment provider.
 *
 * IMPORTANT: this project does not integrate a real payment gateway. Card
 * numbers/CVV entered in the Checkout UI are used only to render the card
 * preview and are never sent to Firestore or any backend here — storing raw
 * card data yourself is a PCI-DSS violation. To accept real payments, swap
 * this module for the client SDK of a real provider (e.g. Mercado Pago
 * Checkout Bricks or Stripe Elements/Payment Element), which tokenizes the
 * card in the browser and only ever hands your backend a token/reference,
 * never the raw card number.
 *
 * `processPayment` simulates network latency and always succeeds, returning
 * a fake reference so the rest of the checkout flow (order creation, status
 * updates) has something real to persist.
 */
export async function processPayment({ method, amount }) {
  await new Promise((resolve) => setTimeout(resolve, 1600));
  return {
    success: true,
    reference: `MOCK-${method.toUpperCase()}-${Date.now()}`,
    amount,
  };
}
