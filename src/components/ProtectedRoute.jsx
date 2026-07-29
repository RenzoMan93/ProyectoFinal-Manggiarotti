import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center py-16 text-gray-500">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/ingresar" state={{ from: location }} replace />;
  }

  return children;
}
