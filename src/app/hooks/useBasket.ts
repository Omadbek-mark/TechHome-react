import { useEffect, useState } from 'react';
import { CartItem } from '../../lib/types/search';
import { readCart, quantityLimit, cartSignature } from '../../lib/order/checkout';

const useBasket = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(readCart);
  useEffect(() => {
    try {
      if (cartItems.length) localStorage.setItem('cartData', JSON.stringify(cartItems));
      else localStorage.removeItem('cartData');
    } catch { /* The current cart remains usable without browser storage. */ }
  }, [cartItems]);
  const onAdd = (input: CartItem) => setCartItems((current) => {
    const limit = quantityLimit(input);
    if (!limit) return current;
    const existing = current.find(item => item._id === input._id);
    if (!existing && current.length >= 50) return current;
    const next = { ...input, quantity: Math.min(limit, (existing?.quantity ?? 0) + 1) };
    return existing ? current.map(item => item._id === input._id ? next : item) : [...current, next];
  });
  const onRemove = (input: CartItem) => setCartItems((current) => current.flatMap(item => item._id !== input._id ? [item] : item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : []));
  const onDelete = (input: CartItem) => setCartItems((current) => current.filter(item => item._id !== input._id));
  const onDeleteAll = (expected?: CartItem[]) => setCartItems((current) =>
    expected && cartSignature(current) !== cartSignature(expected) ? current : []);
  return { cartItems, onAdd, onRemove, onDelete, onDeleteAll };
};
export default useBasket;
