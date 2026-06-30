import { adminFetch } from './hmac';

export type ItemStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

export interface Item {
  uuid: string;
  name: string;
  description?: string;
  imageUrls: string[];
  price: number;
  weight: number;
  status: ItemStatus;
  quantity: number;
  color?: string;
  collection?: { uuid: string; name: string };
}

export interface ItemRequest {
  name: string;
  description?: string;
  price: number;
  weight: number;
  status: ItemStatus;
  quantity: number;
  color?: string;
  existingImageUrls?: string[];
}

// Items are public to read
export async function getItems(): Promise<Item[]> {
  const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/items`);
  if (!res.ok) throw new Error(`Failed to fetch items: ${res.status}`);
  return res.json();
}

export async function createItem(secret: string, item: ItemRequest, images?: File[]): Promise<Item> {
  const form = new FormData();
  form.append('item', new Blob([JSON.stringify(item)], { type: 'application/json' }));
  images?.forEach(img => form.append('images', img));

  const path = '/api/admin/items';
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const { computeHmacHeader } = await import('./hmac');
  const signature = await computeHmacHeader('POST', path, timestamp, secret);

  const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}${path}`, {
    method: 'POST',
    headers: { 'X-Admin-Signature': signature, 'X-Admin-Timestamp': timestamp },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Failed to create item: ${res.status}`);
  }
  return res.json();
}

export async function updateItem(secret: string, uuid: string, item: ItemRequest, images?: File[]): Promise<Item> {
  const form = new FormData();
  form.append('item', new Blob([JSON.stringify(item)], { type: 'application/json' }));
  images?.forEach(img => form.append('images', img));

  const path = `/api/admin/items/${uuid}`;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const { computeHmacHeader } = await import('./hmac');
  const signature = await computeHmacHeader('PUT', path, timestamp, secret);

  const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}${path}`, {
    method: 'PUT',
    headers: { 'X-Admin-Signature': signature, 'X-Admin-Timestamp': timestamp },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Failed to update item: ${res.status}`);
  }
  return res.json();
}

export async function updateQuantity(secret: string, uuid: string, quantity: number): Promise<Item> {
  const res = await adminFetch(
    `/api/admin/items/${uuid}/quantity?quantity=${quantity}`,
    { method: 'PATCH' },
    secret
  );
  if (!res.ok) throw new Error(`Failed to update quantity: ${res.status}`);
  return res.json();
}

export async function deleteItem(secret: string, uuid: string): Promise<void> {
  const res = await adminFetch(`/api/admin/items/${uuid}`, { method: 'DELETE' }, secret);
  if (!res.ok) throw new Error(`Failed to delete item: ${res.status}`);
}
