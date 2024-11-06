import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">SportStyle</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Inicio</Link>
        <Link to="/category/running">Running</Link>
        <Link to="/category/gym">Gym</Link>
        <Link to="/category/cycling">Cycling</Link>
      </div>
      <div className="navbar-cart">
        🛒 Carrito
      </div>
    </nav>
  );
};

export default NavBar;
