
import { OrderStatus } from "../enums/order.enum";
import { Product } from "./product";

export interface OrderItemInput {
  itemQuantity: number;
  productId: string;
}

export interface OrderItem {
  _id: string;
  itemQuantity: number;
  itemPrice: number;
  itemPriceCents?: number;
  productName?: string;
  productImage?: string;
  installmentMonths?: number;
  installmentMonthly?: number;
  installmentLastMonth?: number;
  orderId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderRecord {
  _id: string;
  orderTotal: number;
  orderDelivery: number;
  orderStatus: OrderStatus;
  memberId: string;
  createdAt: string;
  updatedAt: string;
  currency?: 'USD';
  paymentMode?: 'DEMO';
  readOnly?: boolean;
}

export interface Order extends OrderRecord {
  /** from Aggregations */
  orderItems: OrderItem[];
  productData: Product[];
}

export interface OrderInquiry {
  page: number;
  limit: number;
  orderStatus: OrderStatus;
}

export interface OrderUpdateInput {
  orderId: string;
  orderStatus: OrderStatus;
}