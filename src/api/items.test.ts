import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getItems } from './items';

function mockPageResponse(overrides: Partial<Record<string, unknown>> = {}) {
  return new Response(
    JSON.stringify({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, ...overrides }),
    { status: 200 }
  );
}

describe('getItems', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockPageResponse()));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to page=0 and size=20 when no params are given', async () => {
    await getItems();

    const [url] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('/api/items?');
    expect(url).toContain('page=0');
    expect(url).toContain('size=20');
  });

  it('passes through custom page and size', async () => {
    await getItems({ page: 2, size: 10 });

    const [url] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('page=2');
    expect(url).toContain('size=10');
  });

  it('returns the parsed page response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(mockPageResponse({ totalElements: 7, totalPages: 1 }))
    );

    const result = await getItems();

    expect(result.totalElements).toBe(7);
    expect(result.totalPages).toBe(1);
  });

  it('throws when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 500 })));

    await expect(getItems()).rejects.toThrow('Failed to fetch items: 500');
  });
});
