# Trueke

Marketplace de segunda mano (React + Firebase). Un solo código React sirve
como **web app** y, empaquetado con Capacitor, como **app de Android/iOS**.

## Qué incluye

- **Feed** — catálogo con búsqueda, chips rápidos y filtro avanzado (precio,
  categoría, estado, color, material, marca), todo contra datos reales de
  Firestore.
- **Detalle de producto** — galería con swipe, resumen generado por IA a
  partir del texto del vendedor, chat en tiempo real con el vendedor.
- **Publicar** — carga de fotos con revisión automática de calidad, formulario
  de datos del producto.
- **Verificación de identidad (KYC)** — datos personales, captura de
  documento y selfie.
- **Checkout** — entrega, medio de pago, confirmación y resultado.
- **Mensajes** y **Perfil** — inbox de conversaciones y estado de cuenta.

## Lo que es real vs. lo que es mock

Este proyecto usa Firebase real (Auth, Firestore, Storage) para todo el
estado de la app. Dos piezas están explícitamente mockeadas porque requieren
proveedores externos que no vienen incluidos:

| Función | Estado | Dónde |
| --- | --- | --- |
| Auth, catálogo, chat, pedidos | **Real** (Firebase) | `src/services/*` |
| Resumen de la publicación por IA | **Real** (Claude, vía Cloud Function) | `functions/index.js` → `summarizeListing` |
| Revisión de fotos | Heurística simple (resolución/peso), no visión real | `src/services/storageService.js` |
| Verificación de identidad (match documento/selfie) | **Mock** — aprueba automáticamente | `functions/index.js` → `reviewKycSubmission` |
| Pago con tarjeta / Mercado Pago / efectivo | **Mock** — nunca se procesa un cobro real, y los datos de tarjeta nunca se guardan | `src/services/paymentProvider.js` |

Cada uno de esos archivos tiene un comentario explicando exactamente qué
haría falta (qué proveedor, qué credenciales) para volverlo real.

## Puesta en marcha (web)

Requisitos: Node 18+, una cuenta de Firebase.

1. **Creá un proyecto de Firebase** en https://console.firebase.google.com
   y activá: Authentication (método Email/Password), Firestore Database y
   Storage.
2. **Instalá dependencias**:
   ```bash
   npm install
   ```
3. **Configurá las credenciales**: copiá `.env.example` a `.env.local` y
   completá los valores desde Firebase console → Configuración del proyecto
   → Tus apps → SDK setup and configuration.
4. **Desplegá las reglas e índices** (una vez, con la Firebase CLI):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add          # elegí tu proyecto
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```
5. **Corré la app**:
   ```bash
   npm run dev
   ```

### Cloud Functions (resumen por IA y revisión de KYC)

```bash
cd functions && npm install
firebase functions:secrets:set ANTHROPIC_API_KEY   # tu API key de Anthropic
firebase deploy --only functions
```

Sin la secret configurada, `summarizeListing` simplemente no corre y el
detalle del producto se queda mostrando "Generando resumen automático…" —
el resto de la app funciona igual.

## App para celular (Android / iOS con Capacitor)

Capacitor empaqueta el build web dentro de un proyecto nativo. Necesitás
Android Studio (para Android) o Xcode en una Mac (para iOS) instalados
localmente — no se pueden generar los binarios nativos desde este entorno.

```bash
npm run build              # genera dist/
npm run cap:add:android    # crea la carpeta android/ (una sola vez)
npm run cap:add:ios        # crea la carpeta ios/ (una sola vez, requiere macOS)

npm run cap:sync           # cada vez que cambiás el código web
npm run cap:open:android   # abre Android Studio para compilar/firmar
npm run cap:open:ios       # abre Xcode para compilar/firmar
```

Las carpetas `android/` e `ios/` quedan gitignoreadas (se regeneran con
`cap add`); si preferís versionarlas para configurar íconos, splash screen o
permisos nativos a mano, sacalas del `.gitignore`.

La cámara para documento/selfie usa `<input type="file" capture>`, que
Capacitor traduce a la cámara nativa sin necesitar un plugin aparte.

## Estructura

```
trueke/
  src/
    pages/          # Feed, Product, Publish, Onboarding, Checkout, Auth, Messages, Profile
    services/        # Toda la lógica de Firestore/Storage/Auth, sin UI
    components/       # BottomNav, ProtectedRoute
    context/          # AuthContext (usuario + perfil en vivo)
  functions/          # Cloud Functions (resumen IA, revisión KYC)
  firestore.rules, storage.rules, firestore.indexes.json
```

## Limitaciones conocidas

- El pago es simulado end-to-end; para cobrar de verdad hay que integrar un
  proveedor real (Mercado Pago Checkout Bricks o Stripe) del lado del
  cliente y nunca mandar el número de tarjeta a tu propio backend.
- La verificación de identidad se auto-aprueba (ver tabla arriba); antes de
  manejar usuarios reales hace falta un proveedor de KYC.
- No hay búsqueda geográfica real: el filtro de "cercanía" del prototipo
  original se sacó porque no hay geocoding de direcciones implementado.
