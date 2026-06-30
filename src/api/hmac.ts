// HMAC signing for admin requests
// message = METHOD + PATH + TIMESTAMP

export async function computeHmacHeader(
  method: string,
  path: string,
  timestamp: string,
  secret: string
): Promise<string> {
  const message = method.toUpperCase() + path + timestamp;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function adminFetch(
  path: string,
  options: RequestInit = {},
  secret: string
): Promise<Response> {
  const method = (options.method ?? 'GET').toUpperCase();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = await computeHmacHeader(method, path, timestamp, secret);
  const baseUrl = import.meta.env.VITE_API_URL ?? '';

  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      'X-Admin-Signature': signature,
      'X-Admin-Timestamp': timestamp,
    },
  });
}
