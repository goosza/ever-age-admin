import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getOrders } from './orders';

function mockPageResponse(overrides: Partial<Record<string, unknown>> = {}) {
  return new Response(
    JSON.stringify({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, ...overrides }),
    { status: 200 }
  );
}

describe('getOrders', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockPageResponse()));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to page=0 and size=20 when no params are given', async () => {
    await getOrders('secret');

    const [url] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('/api/admin/orders?');
    expect(url).toContain('page=0');
    expect(url).toContain('size=20');
    expect(url).not.toContain('status=');
  });

  it('includes the status filter only when provided', async () => {
    await getOrders('secret', { status: 'SHIPPED' });

    const [url] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('status=SHIPPED');
  });

  it('passes through custom page and size', async () => {
    await getOrders('secret', { page: 3, size: 50 });

    const [url] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('page=3');
    expect(url).toContain('size=50');
  });

  it('returns the parsed page response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(mockPageResponse({ totalElements: 42, totalPages: 3 }))
    );

    const result = await getOrders('secret');

    expect(result.totalElements).toBe(42);
    expect(result.totalPages).toBe(3);
  });

  it('throws when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 500 })));

    await expect(getOrders('secret')).rejects.toThrow('Failed to fetch orders: 500');
  });
});
