import React, { useEffect, useState } from 'react';
import ItemList from './ItemList';
import { collection, getDocs } from 'Firebase/Firestore';
import { db } from '../Firebaseconfig';

const ItemListContainer = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const productCollection = collection(db, 'products');
      const productSnapshot = await getDocs(productCollection);
      const productList = productSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productList);
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h2>Catálogo de Productos</h2>
      <ItemList products={products} />
    </div>
  );
};

export default ItemListContainer;
