const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');

/**
 * Turns a seller's free-text description into the structured summary shown
 * on the product page (condition, what's included, sale reason, things to
 * watch out for). This is the one place in the project that calls a real
 * LLM — and it only happens here, server-side, because the API key must
 * never be shipped to the client.
 *
 * Setup: `firebase functions:secrets:set ANTHROPIC_API_KEY`
 * If the secret isn't configured, the function skips silently and the
 * product page keeps showing its "generando resumen…" state forever —
 * that's expected until you set the secret.
 */
exports.summarizeListing = onDocumentCreated(
  { document: 'products/{productId}', secrets: [anthropicApiKey] },
  async (event) => {
    const snap = event.data;
    const product = snap.data();
    if (!product?.description || product.aiSummary) return;

    const apiKey = anthropicApiKey.value();
    if (!apiKey) {
      logger.warn('ANTHROPIC_API_KEY not configured — skipping aiSummary generation.');
      return;
    }

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey });

    const prompt = `Sos un asistente que organiza publicaciones de un marketplace de segunda mano llamado Trueke.
A partir del texto libre que escribió el vendedor, devolvé ÚNICAMENTE un JSON (sin texto adicional, sin markdown)
con esta forma exacta:
{"condition": "...", "includes": "...", "saleReason": "...", "notes": "..."}

Reglas:
- Cada campo es un string corto (1-2 oraciones) en español rioplatense.
- Si el vendedor no menciona algo, dejá ese campo como string vacío "" — no inventes información.
- "condition": estado y funcionamiento del producto.
- "includes": qué accesorios/extras incluye la venta.
- "saleReason": por qué lo vende, si lo dice.
- "notes": desperfectos o cosas a tener en cuenta que el vendedor haya mencionado.

Texto del vendedor:
"""${product.description}"""`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = response.content?.[0]?.text?.trim() || '{}';
      const parsed = JSON.parse(text);

      await snap.ref.update({
        aiSummary: {
          condition: parsed.condition || '',
          includes: parsed.includes || '',
          saleReason: parsed.saleReason || '',
          notes: parsed.notes || '',
        },
      });
    } catch (err) {
      logger.error('summarizeListing failed', err);
    }
  }
);

/**
 * Placeholder for the real identity-verification pipeline. Real KYC needs a
 * dedicated vendor (Veriff, Onfido, AWS Rekognition face-match, etc.) that
 * you'd call here with the uploaded document/selfie URLs, then flip
 * verificationStatus only once THEY confirm a match — usually via their own
 * async webhook, not synchronously in this trigger.
 *
 * No such vendor is wired up in this project. To keep the onboarding flow
 * demoable end-to-end without one, this mock auto-approves any submission
 * that has all three required files — it does NOT check that the documents
 * are real or that the selfie matches. Replace the block below with a real
 * vendor call before this ever handles real users.
 */
exports.reviewKycSubmission = onDocumentUpdated('users/{uid}', async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  if (after.verificationStatus !== 'pending' || before.verificationStatus === 'pending') return;
  if (!after.docFrontUrl || !after.docBackUrl || !after.selfieUrl) return;

  // --- MOCK REVIEW (replace with a real KYC vendor call) ---
  await db.doc(`users/${event.params.uid}`).update({
    verificationStatus: 'verified',
    mockReview: true,
    reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  logger.info(`Mock-verified user ${event.params.uid} — wire up a real KYC vendor before going live.`);
});
