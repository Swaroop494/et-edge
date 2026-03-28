export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function apiFetch<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
  return res.json() as Promise<T>;
}
