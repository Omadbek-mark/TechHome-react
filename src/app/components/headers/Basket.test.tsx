import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Basket from './Basket';
import { GlobalContext } from '../../hooks/useGlobals';
import OrderService from '../../services/OrderService';
import { Member } from '../../../lib/types/member';
import { CartItem } from '../../../lib/types/search';
import { OrderRecord } from '../../../lib/types/order';
const item: CartItem = { _id: 'a'.repeat(24), quantity: 1, name: 'Fixture kettle', price: 1, image: 'test.png', stock: 1 };
const member = { _id: 'buyer' } as Member;
const cleared = vi.fn();
function setup() {
  const history = createMemoryHistory();
  render(<GlobalContext.Provider value={{ authState: 'authenticated', authMember: member, beginAuthChange: vi.fn(), refreshSession: vi.fn(), setAuthMember: vi.fn(), orderBuilder: new Date(), setOrderBuilder: vi.fn() }}>
    <Router history={history}><Basket cartItems={[item]} onAdd={vi.fn()} onRemove={vi.fn()} onDelete={vi.fn()} onDeleteAll={cleared} /></Router>
  </GlobalContext.Provider>);
  fireEvent.click(screen.getByRole('button', { name: 'Cart' })); return history;
}
beforeEach(() => { cleared.mockClear(); sessionStorage.clear(); });
it('blocks double submit, preserves failed cart and retries with the same key, using server total', async () => {
  let reject!: (error: Error) => void;
  const submit = vi.spyOn(OrderService.prototype, 'createOrder').mockImplementationOnce(() => new Promise((_, fail) => { reject = fail; })).mockResolvedValue({ orderTotal: 89.50 } as OrderRecord);
  const history = setup();
  expect(screen.getByRole('button', { name: 'Increase Fixture kettle' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Order' }));
  fireEvent.click(screen.getByRole('button', { name: 'Placing order…' }));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Clear cart' })).toBeDisabled();
  await act(async () => reject(new Error('offline')));
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to complete the request');
  expect(cleared).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Order' }));
  await waitFor(() => expect(history.location.pathname).toBe('/orders'));
  expect(submit.mock.calls[0][1]).toBe(submit.mock.calls[1][1]);
  expect(cleared).toHaveBeenCalledWith([item]);
  expect(history.location.state).toEqual({ checkoutTotal: 89.50 });
});
