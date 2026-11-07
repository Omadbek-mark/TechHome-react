import { CartItem } from '../types/search';

const storageKey = 'techhome.checkout-intent.v1';
interface Intent { memberId: string; signature: string; key: string; }
let cachedIntent: Intent | undefined;

export function cartSignature(items: CartItem[]): string {
  const totals = new Map<string, number>();
  for (const item of items) totals.set(item._id, (totals.get(item._id) ?? 0) + item.quantity);
  return JSON.stringify([...totals].sort(([a], [b]) => a.localeCompare(b)));
}
export function quantityLimit(item: CartItem): number {
  return Math.min(99, Number.isSafeInteger(item.stock) && item.stock! >= 0 ? item.stock! : 99);
}
export function readCart(): CartItem[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('cartData') ?? '[]');
    if (!Array.isArray(value) || value.length > 50) return [];
    const items = new Map<string, CartItem>();
    for (const item of value) {
      if (!item || typeof item._id !== 'string' || !/^[a-f0-9]{24}$/i.test(item._id) ||
          !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99 ||
          typeof item.name !== 'string' || item.name.length > 200 || typeof item.price !== 'number' ||
          !Number.isFinite(item.price) || item.price < 0 || typeof item.image !== 'string' || item.image.length > 2048) continue;
      const clean: CartItem = { _id: item._id.toLowerCase(), quantity: item.quantity, name: item.name, price: item.price, image: item.image,
        stock: Number.isSafeInteger(item.stock) && item.stock >= 0 ? item.stock : undefined };
      clean.quantity = Math.min(quantityLimit(clean), (items.get(clean._id)?.quantity ?? 0) + clean.quantity);
      if (clean.quantity > 0) items.set(clean._id, clean);
    }
    return [...items.values()];
  } catch { return []; }
}
function storedIntent(): Intent | undefined {
  try {
    const value = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null');
    if (value && typeof value.memberId === 'string' && typeof value.signature === 'string' && value.signature.length <= 10000 &&
        typeof value.key === 'string' && /^[a-f0-9-]{36}$/i.test(value.key)) return value;
  } catch { /* Corrupt or disabled storage is never an auth source. */ }
  return undefined;
}
export function checkoutIntent(memberId: string, items: CartItem[]): string {
  if (!items.length) throw new Error('Your cart is empty.');
  const signature = cartSignature(items);
  const previous = cachedIntent ?? storedIntent();
  if (previous?.memberId === memberId && previous.signature === signature) return previous.key;
  const next = { memberId, signature, key: crypto.randomUUID() };
  cachedIntent = next;
  try { sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Same-tab memory still preserves retries. */ }
  return next.key;
}
export function completeCheckout(key: string) {
  const previous = cachedIntent ?? storedIntent();
  if (previous?.key !== key) return;
  cachedIntent = undefined;
  try { sessionStorage.removeItem(storageKey); } catch { /* No persisted intent. */ }
}
