import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebaseconfig';
import ItemDetail from './ItemDetail';

const ItemDetailContainer = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const productDoc = doc(db, 'products', id);
      const productSnapshot = await getDoc(productDoc);
      if (productSnapshot.exists()) {
        setProduct({ id: productSnapshot.id, ...productSnapshot.data() });
      }
    };

    fetchProduct();
  }, [id]);

  return (
    <div>
      {product ? <ItemDetail product={product} /> : <p>Cargando...</p>}
    </div>
  );
};

export default ItemDetailContainer;
