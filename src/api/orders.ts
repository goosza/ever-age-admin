import { adminFetch } from './hmac';

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  uuid: string;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderShipping {
  uuid: string;
  provider: string;
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
  pickupPointName?: string;
  pickupPointAddress?: string;
  estimatedDelivery?: string;
  cost: number;
}

export interface Order {
  uuid: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shipping?: OrderShipping;
  createdAt: string;
  updatedAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface GetOrdersParams {
  status?: string;
  page?: number;
  size?: number;
}

export async function getOrders(secret: string, params: GetOrdersParams = {}): Promise<Page<Order>> {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? 20));

  const res = await adminFetch(`/api/admin/orders?${query.toString()}`, {}, secret);
  if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);
  return res.json();
}

export async function getOrder(secret: string, uuid: string): Promise<Order> {
  const res = await adminFetch(`/api/admin/orders/${uuid}`, {}, secret);
  if (!res.ok) throw new Error(`Failed to fetch order: ${res.status}`);
  return res.json();
}

export async function shipOrder(secret: string, uuid: string): Promise<Order> {
  const res = await adminFetch(`/api/admin/orders/${uuid}/ship`, { method: 'POST' }, secret);
  if (!res.ok) throw new Error(`Failed to ship order: ${res.status}`);
  return res.json();
}

export async function deliverOrder(secret: string, uuid: string): Promise<Order> {
  const res = await adminFetch(`/api/admin/orders/${uuid}/deliver`, { method: 'POST' }, secret);
  if (!res.ok) throw new Error(`Failed to deliver order: ${res.status}`);
  return res.json();
}

export async function cancelOrder(secret: string, uuid: string): Promise<Order> {
  const res = await adminFetch(`/api/admin/orders/${uuid}/cancel`, { method: 'POST' }, secret);
  if (!res.ok) throw new Error(`Failed to cancel order: ${res.status}`);
  return res.json();
}
