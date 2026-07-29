# ReUsalo — Second hand en Uruguay

App web para publicar y encontrar artículos de segunda mano cerca tuyo, en cualquier departamento de Uruguay.

## Funcionalidades

- **Publicar en menos de un minuto**: formulario mínimo (foto, título, precio, categoría, condición y ubicación) en `/publicar`.
- **Chat integrado**: conversación en tiempo real entre comprador y vendedor por cada publicación (`/mensajes`).
- **Ubicación aproximada**: departamento/barrio + geolocalización del navegador redondeada a ~1km (no se guarda la posición exacta).
- **Calificaciones de usuarios**: rating de 1 a 5 estrellas con comentario, visible en el perfil de cada usuario.
- **Productos destacados**: el vendedor puede marcar sus publicaciones como destacadas; aparecen en un carrusel en el Home.
- **Notificaciones de búsquedas guardadas**: guardás una alerta (palabra clave, categoría, precio máximo) y recibís una notificación in-app cuando se publica algo que coincide.

## Stack

React 19 + Vite, React Router, Tailwind CSS v4 y Firebase (Auth, Firestore, Storage).

## Puesta en marcha

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/):
   - Habilitar **Authentication → Email/Password**.
   - Crear una base **Firestore** (modo producción).
   - Habilitar **Storage**.
   - En "Configuración del proyecto" → "Tus apps", crear una app web y copiar las credenciales.

3. Copiar `.env.example` a `.env` y completar con las credenciales de tu proyecto Firebase:

   ```bash
   cp .env.example .env
   ```

4. Desplegar las reglas de seguridad (con [Firebase CLI](https://firebase.google.com/docs/cli)):

   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```

   Si preferís no instalar la CLI, podés pegar el contenido de `firestore.rules` y `storage.rules` manualmente en la consola de Firebase (Firestore → Reglas / Storage → Reglas). Los índices compuestos de `firestore.indexes.json` también se crean automáticamente la primera vez que Firestore te muestra el enlace de error en la consola del navegador.

5. Correr en desarrollo:

   ```bash
   npm run dev
   ```

## Notas sobre el diseño

- El **matching de búsquedas guardadas** (feature de notificaciones) se resuelve en el cliente al momento de publicar, sin Cloud Functions: por eso las reglas de Firestore permiten que cualquier usuario autenticado lea la colección `busquedasGuardadas` (necesario para comparar la nueva publicación contra las alertas de todos). Es una simplificación válida para un MVP; en producción conviene mover esa lógica a una Cloud Function con permisos de administrador para no exponer las búsquedas guardadas de otros usuarios.
- Las calificaciones solo se habilitan entre usuarios que ya iniciaron un chat entre sí, como aproximación simple a "usuarios que ya operaron juntos".
- La ubicación se redondea a ~1km de precisión antes de guardarse: nunca se persiste la posición exacta del dispositivo.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run lint` — oxlint
- `npm run preview` — sirve el build de producción localmente
