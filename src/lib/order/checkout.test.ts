import { beforeEach, expect, it, vi } from 'vitest';
import { CartItem } from '../types/search';
const item: CartItem = { _id: 'a'.repeat(24), name: 'Fixture', image: 'test.png', price: 42, quantity: 1, stock: 3 };
beforeEach(() => { sessionStorage.clear(); vi.resetModules(); });
it('keeps one intent across retries, reordered rows and a reload, but separates edited carts and accounts', async () => {
  let checkout = await import('./checkout');
  const second = { ...item, _id: 'b'.repeat(24) };
  const key = checkout.checkoutIntent('buyer', [item, second]);
  expect(checkout.checkoutIntent('buyer', [second, { ...item, price: 999 }])).toBe(key);
  vi.resetModules(); checkout = await import('./checkout');
  expect(checkout.checkoutIntent('buyer', [item, second])).toBe(key);
  const edited = checkout.checkoutIntent('buyer', [{ ...item, quantity: 2 }]);
  expect(edited).not.toBe(key);
  checkout.completeCheckout(key);
  expect(checkout.checkoutIntent('buyer', [{ ...item, quantity: 2 }])).toBe(edited);
  expect(checkout.checkoutIntent('other', [{ ...item, quantity: 2 }])).not.toBe(edited);
});
it('drops corrupt cart storage, invalid rows and zero stock, and clamps quantities', async () => {
  const { readCart } = await import('./checkout');
  localStorage.setItem('cartData', 'broken'); expect(readCart()).toEqual([]);
  localStorage.setItem('cartData', JSON.stringify([{ ...item, quantity: 9 }, { ...item, _id: 'b'.repeat(24), stock: 0 }, { ...item, quantity: -1 }]));
  expect(readCart()).toEqual([{ ...item, quantity: 3 }]);
});
