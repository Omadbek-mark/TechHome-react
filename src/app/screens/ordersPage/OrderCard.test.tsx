import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import OrderCard from './OrderCard';
import { Order } from '../../../lib/types/order';
it('renders server snapshots even when the product was deleted, and marks historical records read-only', () => {
  render(<OrderCard order={{ _id: 'fixture', orderTotal: 38.03, orderDelivery: 5, createdAt: '2026-11-01T00:00:00Z', readOnly: true, productData: [], orderItems: [{ _id: 'item', productName: 'Original kettle', itemQuantity: 3, itemPrice: 11.01 }] } as unknown as Order} />);
  expect(screen.getByText('Original kettle')).toBeInTheDocument();
  expect(screen.getByText('Total: $38.03')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('view only');
});
