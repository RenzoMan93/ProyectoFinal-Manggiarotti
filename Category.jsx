import React from 'react';
import { useParams } from 'react-router-dom';

const Category = () => {
  const { category } = useParams();

  return (
    <div>
      <h1>Productos en la Categoría: {category}</h1>
         </div>
  );
};

export default Category;
