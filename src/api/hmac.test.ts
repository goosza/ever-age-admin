import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHmac } from 'node:crypto';
import { computeHmacHeader, adminFetch } from './hmac';

// Cross-check against Node's crypto module, independent of the implementation under test.
function referenceHmac(method: string, path: string, timestamp: string, secret: string) {
  const message = method.toUpperCase() + path + timestamp;
  return createHmac('sha256', secret).update(message).digest('hex');
}

describe('computeHmacHeader', () => {
  it('matches an independently computed HMAC-SHA256 signature', async () => {
    const signature = await computeHmacHeader('GET', '/api/admin/orders', '1700000000', 'my-secret');
    expect(signature).toBe(referenceHmac('GET', '/api/admin/orders', '1700000000', 'my-secret'));
  });

  it('uppercases the HTTP method before signing', async () => {
    const lower = await computeHmacHeader('post', '/api/admin/items', '123', 'secret');
    const upper = await computeHmacHeader('POST', '/api/admin/items', '123', 'secret');
    expect(lower).toBe(upper);
  });

  it('produces different signatures for different paths', async () => {
    const a = await computeHmacHeader('GET', '/api/admin/orders', '123', 'secret');
    const b = await computeHmacHeader('GET', '/api/admin/items', '123', 'secret');
    expect(a).not.toBe(b);
  });

  it('produces different signatures for different secrets', async () => {
    const a = await computeHmacHeader('GET', '/api/admin/orders', '123', 'secret-a');
    const b = await computeHmacHeader('GET', '/api/admin/orders', '123', 'secret-b');
    expect(a).not.toBe(b);
  });

  it('returns a lowercase hex string', async () => {
    const signature = await computeHmacHeader('GET', '/api/admin/orders', '123', 'secret');
    expect(signature).toMatch(/^[0-9a-f]+$/);
  });
});

describe('adminFetch', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('attaches X-Admin-Signature and X-Admin-Timestamp headers', async () => {
    await adminFetch('/api/admin/orders', {}, 'my-secret');

    expect(fetch).toHaveBeenCalledTimes(1);
    const [, options] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    const headers = options.headers as Record<string, string>;

    expect(headers['X-Admin-Signature']).toMatch(/^[0-9a-f]+$/);
    expect(headers['X-Admin-Timestamp']).toMatch(/^\d+$/);
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('defaults to GET when no method is provided', async () => {
    await adminFetch('/api/admin/orders', {}, 'my-secret');
    const [url] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('/api/admin/orders');
  });

  it('signs the method that was actually requested', async () => {
    await adminFetch('/api/admin/orders/123/ship', { method: 'POST' }, 'my-secret');
    const [, options] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    const headers = options.headers as Record<string, string>;
    const timestamp = headers['X-Admin-Timestamp'];

    const expected = referenceHmac('POST', '/api/admin/orders/123/ship', timestamp, 'my-secret');
    expect(headers['X-Admin-Signature']).toBe(expected);
  });
});
