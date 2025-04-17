/* ------------------------------------------------------------------ */
/*  Generic JSON POST helper                                          */
/*  – Ensures every request hits the Flask origin, never the FE URL   */
/* ------------------------------------------------------------------ */
const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ||
  'http://localhost:5000';                 // dev fallback

export async function postJson<T extends Record<string, unknown>, R>(
  path: string,
  payload: T,
): Promise<R> {
  const url = `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',               // keep Flask session cookie
  });

  const isJson =
    res.headers.get('content-type')?.includes('application/json') ?? false;
  const data = isJson && res.status !== 204 ? await res.json() : null;

  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status} ${res.statusText}`);
  if (data === null) throw new Error('Empty JSON response from server');

  return data as R;
}
