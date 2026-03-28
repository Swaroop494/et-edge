export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';

export async function apiFetch<T = unknown>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) {
      console.warn(`API error ${res.status} on ${path}`);
      return null;
    }
    return await res.json() as T;
  } catch (err) {
    console.error(`Network error fetching ${path}:`, err);
    return null;
  }
}
