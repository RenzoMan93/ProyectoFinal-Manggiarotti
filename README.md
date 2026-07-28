# Reportes UY

Plataforma de reportes ciudadanos para Uruguay. Permite publicar y consultar reportes
en tres áreas de problemas sociales:

- 🛡️ **Seguridad**: robos, hurtos, rapiñas, vandalismo, etc.
- 🚗 **Tránsito y vehicular**: siniestros, robos de vehículos, infracciones, estado de vías.
- 🛒 **Compras y consumo**: estafas, sobreprecios, mala atención, productos defectuosos.

Los reportes se pueden filtrar por categoría y por departamento, apoyar (upvote) y
marcar como resueltos por su autor.

## Stack

- React 18 + Vite
- React Router
- Firebase (Authentication + Firestore)

## Puesta en marcha

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/):
   - Habilitar **Authentication** → método Email/Password.
   - Habilitar **Firestore Database** (modo producción o prueba).

3. Copiar `.env.example` a `.env` y completar con las credenciales de tu app web
   de Firebase (Configuración del proyecto → tus apps → SDK config):

   ```bash
   cp .env.example .env
   ```

4. Reglas de Firestore sugeridas para `reports` (colección `reports`):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /reports/{reportId} {
         allow read: if true;
         allow create: if request.auth != null;
         allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
       }
     }
   }
   ```

5. Correr en desarrollo:

   ```bash
   npm run dev
   ```

6. Compilar para producción:

   ```bash
   npm run build
   ```

## Estructura

```
src/
  components/   NavBar, ReportCard, Filters, ProtectedRoute
  context/      AuthContext (login/registro/logout con Firebase Auth)
  data/         constantes: categorías, subcategorías, departamentos, estados
  firebase/     configuración de Firebase (auth + firestore)
  pages/        Home, CategoryPage, ReportDetail, NewReport, MyReports, Login, Register
  services/     reportsService (CRUD sobre Firestore)
```

## Próximos pasos posibles

- Geolocalización / mapa real en vez de departamento + barrio como texto.
- Comentarios en cada reporte.
- Panel de moderación para autoridades locales.
- Notificaciones cuando un reporte cercano se actualiza.
