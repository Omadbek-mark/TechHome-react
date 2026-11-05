import { translate } from '../../lib/i18n';
import { useRef, useState } from 'react';
import { OrderStatus } from '../../lib/enums/order.enum';
import { useGlobals } from './useGlobals';
import OrderService from '../services/OrderService';

export default function useOrderAction(setValue: (value: string) => void) {
  const { authMember, setOrderBuilder } = useGlobals();
  const locks = useRef(new Set<string>());
  const [pending, setPending] = useState<string[]>([]);
  const [error, setError] = useState<unknown>(null);
  const update = async (orderId: string, status: OrderStatus) => {
    if (!authMember || locks.current.has(orderId)) return;
    const message = status === OrderStatus.DELETE ? 'Cancel this order and release its stock?' : status === OrderStatus.PROCESS ? 'Confirm this DEMO order? No money will be charged.' : 'Confirm that this demo order has been received?';
    if (!window.confirm(translate(message))) return;
    locks.current.add(orderId); setPending([...locks.current]); setError(null);
    try {
      const result = await new OrderService().updateOrder({ orderId, orderStatus: status });
      if (result.orderStatus === OrderStatus.PROCESS) setValue('2');
      if (result.orderStatus === OrderStatus.FINISH) setValue('3');
      setOrderBuilder(new Date());
    } catch (err: any) {
      setError(err);
      if (err?.response?.status === 409) setOrderBuilder(new Date());
    } finally { locks.current.delete(orderId); setPending([...locks.current]); }
  };
  return { update, pending, error };
}
