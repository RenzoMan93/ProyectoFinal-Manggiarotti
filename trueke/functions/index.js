const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');

/**
 * Turns a seller's free-text description into the structured data shown on
 * the product page: the summary (condition, what's included, sale reason,
 * things to watch out for) AND the standalone specs — brand, material,
 * color — that used to be separate Publish form fields. Sellers now just
 * mention that stuff in the description and this function pulls it out, so
 * every listing ends up with the same spec format regardless of how the
 * seller wrote about it. This is the one place in the project that calls a
 * real LLM — and it only happens here, server-side, because the API key
 * must never be shipped to the client.
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
{"condition": "...", "includes": "...", "saleReason": "...", "notes": "...", "brand": "...", "material": "...", "color": "..."}

Reglas:
- No inventes información que no esté en el texto — si el vendedor no menciona algo, dejá ese campo como string vacío "".
- "condition", "includes", "saleReason", "notes": strings cortos (1-2 oraciones) en español rioplatense.
  - "condition": estado y funcionamiento del producto.
  - "includes": qué accesorios/extras incluye la venta.
  - "saleReason": por qué lo vende, si lo dice.
  - "notes": desperfectos o cosas a tener en cuenta que el vendedor haya mencionado.
- "brand": la marca del producto (ej: "Trek", "Samsung"), solo el nombre, sin explicación.
- "material": el material principal (ej: "Aluminio", "Algodón"), solo el nombre.
- "color": el color principal (ej: "Verde oliva", "Negro mate"), solo el nombre.

Texto del vendedor:
"""${product.description}"""`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
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
        brand: parsed.brand || null,
        material: parsed.material || null,
        color: parsed.color || null,
      });
    } catch (err) {
      logger.error('summarizeListing failed', err);
    }
  }
);

const PROHIBITED_POLICY = `- Alimentos o bebidas (comestibles de cualquier tipo).
- Medicamentos y productos de farmacia.
- Suplementos y superalimentos.
- Cremas, cosméticos y productos de skin care (maquillaje, esmalte de uñas, bronceadores, etc.).
- Artículos de laboratorio, con fecha de vencimiento, o que requieran habilitación del MSP u otro organismo regulador.
- Productos inflamables, químicos, alcoholes o perfumes.
- Alquileres de cualquier tipo (inmuebles, autos, o cualquier otro producto ofrecido en alquiler en vez de venta) y
  cualquier servicio (Trueke es exclusivamente para venta de productos, no para prestación de servicios).`;

/**
 * Server-side backstop for the category ban Publish.jsx already enforces
 * client-side (see src/utils/prohibitedItems.js) with a keyword list. A
 * keyword list is easy to bypass (typos, synonyms, a different language) —
 * this is a second, independent check that reads the listing the same way
 * a human moderator would, and it runs regardless of what the client sent.
 * If it finds a real violation, the listing is pulled from the public
 * catalog (status moves off 'active', which Feed's query already filters
 * on) instead of relying on the client to have blocked it in the first
 * place.
 */
exports.moderateListing = onDocumentCreated(
  { document: 'products/{productId}', secrets: [anthropicApiKey] },
  async (event) => {
    const snap = event.data;
    const product = snap.data();
    if (!product || product.status !== 'active') return;

    const apiKey = anthropicApiKey.value();
    if (!apiKey) {
      logger.warn('ANTHROPIC_API_KEY not configured — skipping moderateListing.');
      return;
    }

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey });

    const prompt = `Sos un moderador de contenido para Trueke, un marketplace de segunda mano. Estas categorías
NO están permitidas en la plataforma:
${PROHIBITED_POLICY}

Evaluá esta publicación y decidí si viola alguna de esas categorías. Devolvé ÚNICAMENTE un JSON (sin texto
adicional, sin markdown) con esta forma exacta: {"violates": true|false, "category": "...", "reason": "..."}
- "violates": true solo si el producto en sí pertenece a una de las categorías prohibidas de arriba, no si
  simplemente las menciona de pasada (ej. "cambio de aceite" en un auto no es un producto químico).
- "category": cuál de las categorías de la lista viola, vacío "" si violates es false.
- "reason": una oración corta explicando por qué, vacío "" si violates es false.

Título: "${product.title || ''}"
Categorías: ${(product.categories || []).join(', ') || 'sin categoría'}
Descripción: """${product.description || ''}"""`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = response.content?.[0]?.text?.trim() || '{}';
      const parsed = JSON.parse(text);

      if (parsed.violates) {
        await snap.ref.update({
          status: 'blocked_policy',
          moderationCategory: parsed.category || '',
          moderationReason: parsed.reason || '',
        });
        logger.info(`Blocked product ${event.params.productId} — ${parsed.category}: ${parsed.reason}`);
      }
    } catch (err) {
      logger.error('moderateListing failed', err);
    }
  }
);

/**
 * Looks at every photo a seller uploaded for a listing and uses Claude's
 * vision capability to pick the one that best represents the product (in
 * focus, well lit, shows the whole item), then reorders `photos` so that
 * one is at index 0. Every screen in the app (Feed cards, product gallery,
 * checkout, profile listings) already renders `photos[0]` as the cover, so
 * nothing else needs to change for the pick to take effect.
 *
 * Runs once per listing (skips if there's only one photo, or once a pick
 * has already been made). Same secret as summarizeListing above —
 * `firebase functions:secrets:set ANTHROPIC_API_KEY` — and calling a
 * vision model on every new listing's photos is real, billed Anthropic API
 * usage, same as summarizeListing.
 */
exports.pickCoverPhoto = onDocumentCreated(
  { document: 'products/{productId}', secrets: [anthropicApiKey] },
  async (event) => {
    const snap = event.data;
    const product = snap.data();
    const photos = product?.photos;
    if (!Array.isArray(photos) || photos.length < 2 || product.coverPhotoPicked) return;

    const apiKey = anthropicApiKey.value();
    if (!apiKey) {
      logger.warn('ANTHROPIC_API_KEY not configured — skipping cover photo selection.');
      return;
    }

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey });

    const prompt = `Estas son las fotos que un vendedor subió para un producto de un marketplace de segunda mano
llamado Trueke${product.title ? ` ("${product.title}")` : ''}, numeradas en el orden en que te las muestro (empezando en 0).
Elegí cuál es la MEJOR para usar como foto de portada (la primera que ve el comprador en el listado): la que
muestra el producto completo, bien iluminada, enfocada, y sin elementos que distraigan.
Respondé ÚNICAMENTE con un JSON (sin texto adicional, sin markdown), con esta forma exacta: {"bestIndex": N}`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-5',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: [
              ...photos.map((url) => ({ type: 'image', source: { type: 'url', url } })),
              { type: 'text', text: prompt },
            ],
          },
        ],
      });
      const text = response.content?.[0]?.text?.trim() || '{}';
      const bestIndex = Number(JSON.parse(text).bestIndex);

      const update = { coverPhotoPicked: true };
      if (Number.isInteger(bestIndex) && bestIndex > 0 && bestIndex < photos.length) {
        update.photos = [photos[bestIndex], ...photos.filter((_, i) => i !== bestIndex)];
      }
      await snap.ref.update(update);
    } catch (err) {
      logger.error('pickCoverPhoto failed', err);
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
