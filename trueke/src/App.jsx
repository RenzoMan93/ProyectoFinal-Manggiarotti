import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Auth from './pages/Auth/Auth.jsx';
import Feed from './pages/Feed/Feed.jsx';
import ProductDetail from './pages/Product/ProductDetail.jsx';
import Publish from './pages/Publish/Publish.jsx';
import Onboarding from './pages/Onboarding/Onboarding.jsx';
import Checkout from './pages/Checkout/Checkout.jsx';
import Messages from './pages/Messages/Messages.jsx';
import Profile from './pages/Profile/Profile.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <div className="app-frame">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/buscar" element={<Feed />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route
            path="/publicar"
            element={
              <ProtectedRoute>
                <Publish />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verificar"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/:id"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mensajes"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function LoginRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="centered-loader">Cargando…</div>;
  if (user) return <Navigate to="/" replace />;
  return <Auth />;
}
