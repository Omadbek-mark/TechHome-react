import { api } from '../../lib/api/client';
import { Order, OrderRecord, OrderInquiry, OrderItemInput, OrderUpdateInput } from '../../lib/types/order';
import { CartItem } from '../../lib/types/search';

class OrderService {
  public async createOrder(input: CartItem[], key: string): Promise<OrderRecord> {
    const items: OrderItemInput[] = input.map(item => ({ productId: item._id, itemQuantity: item.quantity }));
    return (await api.post('/order/create', items, { headers: { 'Idempotency-Key': key } })).data;
  }
  public async getMyOrders(input: OrderInquiry): Promise<Order[]> {
    return (await api.get('/order/all', { params: input })).data;
  }
  public async updateOrder(input: OrderUpdateInput): Promise<OrderRecord> {
    return (await api.post('/order/update', input)).data;
  }
}
export default OrderService;
