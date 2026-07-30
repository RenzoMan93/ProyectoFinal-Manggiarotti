import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigurado = Boolean(firebaseConfig.apiKey);

// Evitamos inicializar los servicios de Firebase si falta configuración:
// getAuth/getFirestore pueden lanzar de forma síncrona (p. ej.
// auth/invalid-api-key) al momento de importar el módulo, lo que tumbaría
// toda la app antes de poder mostrar la pantalla de "falta configurar".
export const app = firebaseConfigurado ? initializeApp(firebaseConfig) : null;
export const auth = firebaseConfigurado ? getAuth(app) : null;
export const db = firebaseConfigurado ? getFirestore(app) : null;
