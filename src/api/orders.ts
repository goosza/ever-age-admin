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

export async function getOrders(secret: string, status?: string): Promise<Order[]> {
  const path = `/api/admin/orders${status ? `?status=${status}` : ''}`;
  const res = await adminFetch(path, {}, secret);
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
