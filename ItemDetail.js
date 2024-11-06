import React, { useState } from 'react';
import ItemCount from './ItemCount';

const ItemDetail = ({ product }) => {
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = (quantity) => {
    setAddedToCart(true);
    console.log(`Añadido al carrito: ${quantity} unidades de ${product.name}`);
  };

  return (
    <div className="item-detail">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p>Precio: ${product.price}</p>
      {addedToCart ? (
        <p>Producto añadido al carrito</p>
      ) : (
        <ItemCount stock={product.stock} onAddToCart={handleAddToCart} />
      )}
    </div>
  );
};

export default ItemDetail;
