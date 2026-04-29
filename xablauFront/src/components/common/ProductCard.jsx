import '../../index.css'

import { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { Cart } from '../../features/cart/Cart';


export function ProductCard({ product }) {
  const [added, setAdded] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  }
}