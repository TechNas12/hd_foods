'use client';

export const TOKEN_KEY = 'hd_foods_token';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (requireAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    let message = error.detail || `API Error: ${res.status}`;
    
    // Handle Pydantic validation errors (array of objects)
    if (Array.isArray(error.detail)) {
      message = error.detail.map((err: any) => {
        // Handle loc which might be like ["body", "password"]
        const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : err.loc;
        return `${field}: ${err.msg}`;
      }).join(', ');
    } else if (typeof error.detail === 'object') {
       message = JSON.stringify(error.detail);
    }
    
    throw new Error(message);
  }

  // Handle 204 No Content
  if (res.status === 204) return null as T;

  return res.json();
}
