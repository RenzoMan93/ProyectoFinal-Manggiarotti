# ReUsalo — versión de producción

Marketplace C2C de artículos de segunda mano para Uruguay. Next.js (App Router) + Tailwind CSS
+ Supabase (Postgres + Auth + Storage). Ver el brief original para el alcance completo por fases.

**Fase actual: Fase 1 — base (Supabase + Next.js + Auth).** El feed, la búsqueda, la IA, el
checkout con MercadoPago y el chat llegan en fases siguientes.

## Puesta en marcha

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear el proyecto en Supabase

1. Andá a [supabase.com/dashboard](https://supabase.com/dashboard) y creá una cuenta (podés
   entrar con GitHub).
2. Creá un proyecto nuevo (**New project**). Elegí una contraseña de base de datos segura y una
   región cercana (ej. South America / São Paulo). El plan gratuito alcanza de sobra para este
   proyecto.
3. Esperá a que termine de aprovisionarse (1-2 minutos).

### 3. Ejecutar la migración SQL

1. En el menú izquierdo del proyecto, andá a **SQL Editor**.
2. Abrí el archivo [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) de
   este repo, copiá **todo** el contenido, y pegalo en el editor.
3. Hacé clic en **Run**. Esto crea todas las tablas, los tipos enum, las políticas de RLS, el
   trigger que crea el perfil al registrarse, y los buckets de Storage (`product-photos` público,
   `kyc-documents` privado).

### 4. Revisar la config de Authentication

Por defecto Supabase pide confirmar el email antes de poder iniciar sesión. Para desarrollo, es
más cómodo desactivarlo:

- Andá a **Authentication → Providers → Email**.
- Desactivá **"Confirm email"**.
- (En producción real, se recomienda dejarlo activado.)

### 5. Copiar las credenciales

1. Andá a **Project Settings → API** (ícono de engranaje).
2. Copiá estos tres valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (sección "secret keys", nunca exponer al cliente) → `SUPABASE_SERVICE_ROLE_KEY`

### 6. Crear el `.env.local`

```bash
cp .env.example .env.local
```

Completá los tres valores de Supabase. Las variables de `ANTHROPIC_API_KEY` y
`MERCADOPAGO_ACCESS_TOKEN` se usan recién en fases siguientes, se pueden dejar vacías por ahora.

### 7. Correr en desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). Si falta alguna credencial, la app va a
mostrar una pantalla explicando qué falta en vez de romper.

## Decisiones de diseño (Fase 1)

- **Login por email, no por teléfono.** El teléfono se guarda como dato de perfil (obligatorio,
  único) para el link de WhatsApp, pero la autenticación es email + contraseña vía Supabase Auth
  — evita depender de un proveedor de SMS pago.
- **`profiles` extiende `auth.users`** en vez de manejar contraseñas a mano: Supabase Auth ya
  hace ese trabajo de forma segura. Un trigger (`handle_new_user`) crea la fila en `profiles`
  automáticamente al registrarse, tomando `name`/`phone` de los metadatos pasados en el `signUp`.
- **RLS (Row Level Security)** activado en todas las tablas — es el equivalente de Supabase a las
  reglas de seguridad de Firestore.
- **`kyc_documents` y `reports`** no tienen política de lectura para el cliente: solo un backend
  con la `service_role` key puede leerlas (para una futura pantalla de moderación/admin).

## Stack

- **Frontend:** Next.js (App Router) + React + Tailwind CSS
- **Backend / DB / Auth / Storage:** Supabase
- **Pagos (Fase 4):** MercadoPago (Split de Pagos + captura diferida)
- **IA (Fase 3):** API de Anthropic (Claude), llamada solo desde el backend
- **Hosting:** Vercel
