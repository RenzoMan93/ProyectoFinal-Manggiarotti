import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { ensureUserProfile } from '../../services/usersService';
import styles from './Auth.module.css';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const reason = reasonForPath(from);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await ensureUserProfile(cred.user.uid, { email });
        navigate('/verificar', { replace: true });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(mapAuthError(err.code));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.brand}>
        true<em>ke</em>
      </div>
      <div className={styles.sub}>{reason || 'Comprá y vendé de segunda mano, con confianza.'}</div>

      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.title}>{mode === 'login' ? 'Iniciá sesión' : 'Creá tu cuenta'}</div>

        <div className={styles.field}>
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div className={styles.error}>{error}</div>

        <button className={styles.submit} type="submit" disabled={submitting}>
          {submitting ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>

        <div className={styles.switch}>
          {mode === 'login' ? (
            <>
              ¿No tenés cuenta? <button type="button" onClick={() => setMode('signup')}>Registrate</button>
            </>
          ) : (
            <>
              ¿Ya tenés cuenta? <button type="button" onClick={() => setMode('login')}>Iniciá sesión</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

/** Explains why a guest landed on the login screen, based on the protected
 * route they were trying to reach (see ProtectedRoute.jsx). Browsing the
 * Feed and product pages never requires an account — only these do. */
function reasonForPath(path) {
  if (path.startsWith('/publicar')) return 'Registrate para poder publicar y vender tus productos.';
  if (path.startsWith('/checkout')) return 'Registrate o iniciá sesión para completar tu compra.';
  if (path.startsWith('/mensajes')) return 'Registrate para chatear con compradores y vendedores.';
  if (path.startsWith('/perfil')) return 'Registrate para ver tu perfil y tus publicaciones.';
  if (path.startsWith('/verificar')) return 'Registrate para verificar tu identidad.';
  return null;
}

function mapAuthError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Ese correo ya tiene una cuenta — probá iniciar sesión.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil (mínimo 6 caracteres).';
    default:
      return 'Ocurrió un error. Probá de nuevo en unos segundos.';
  }
}
