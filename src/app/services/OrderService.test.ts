import { expect, it, vi } from 'vitest';
import { api } from '../../lib/api/client';
import OrderService from './OrderService';
it('sends only product and quantity with the caller intent key, never client prices', async () => {
  const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { orderTotal: 89.5 } });
  await new OrderService().createOrder([{ _id: 'a'.repeat(24), quantity: 2, price: 0.01, name: 'Spoof', image: 'x' }], 'stable-intent');
  expect(post).toHaveBeenCalledWith('/order/create', [{ productId: 'a'.repeat(24), itemQuantity: 2 }], { headers: { 'Idempotency-Key': 'stable-intent' } });
});
