import React, { useState } from 'react';

const ItemCount = ({ stock, onAddToCart }) => {
  const [count, setCount] = useState(1);

  const handleIncrease = () => {
    if (count < stock) setCount(count + 1);
  };

  const handleDecrease = () => {
    if (count > 1) setCount(count - 1);
  };

  const handleAdd = () => {
    if (count > 0 && count <= stock) {
      onAddToCart(count);
    }
  };

  return (
    <div className="item-count">
      <button onClick={handleDecrease} disabled={count <= 1}>-</button>
      <span>{count}</span>
      <button onClick={handleIncrease} disabled={count >= stock}>+</button>
      <button onClick={handleAdd}>Añadir al Carrito</button>
    </div>
  );
};

export default ItemCount;
