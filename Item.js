import React from 'react';
import { Link } from 'react-router-dom';

const Item = ({ product }) => {
  return (
    <div className="item">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p>Precio: ${product.price}</p>
      <Link to={`/product/${product.id}`}>Ver Detalle</Link>
    </div>
  );
};

export default Item;
