import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../data/constants';

const NavBar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🇺🇾 Reportes UY</Link>
      </div>
      <div className="navbar-links">
        {CATEGORIES.map((cat) => (
          <Link key={cat.id} to={`/categoria/${cat.id}`}>
            {cat.icon} {cat.label}
          </Link>
        ))}
      </div>
      <div className="navbar-actions">
        {currentUser ? (
          <>
            <Link to="/nuevo-reporte" className="btn btn-primary">
              + Reportar
            </Link>
            <Link to="/mis-reportes">Mis reportes</Link>
            <button className="btn-link" onClick={handleLogout}>
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Ingresar</Link>
            <Link to="/registro" className="btn btn-primary">
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
