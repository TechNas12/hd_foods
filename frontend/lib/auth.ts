import { apiFetch, setToken, getToken, TOKEN_KEY } from './api-client';
import type { User } from './types';

// ─────────────────────────────────────────────
// Auth state helpers
// ─────────────────────────────────────────────
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!getToken();
};

export { getToken, setToken };

export const getSession = () => {
  const token = getToken();
  return token ? { access_token: token } : null;
};

// ─────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────
export const login = async (email: string, password: string) => {
  const data = await apiFetch<any>('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  setToken(data.access_token);
  // Optionally trigger a custom event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-change'));
  }
  return data;
};

// ─────────────────────────────────────────────
// Signup 
// ─────────────────────────────────────────────
export const signup = async (
  name: string,
  email: string,
  password: string,
  phone?: string,
) => {
  const data = await apiFetch<any>('/users/register', {
    method: 'POST',
    body: JSON.stringify({ full_name: name, email, password, phone }),
  });

  setToken(data.access_token);
  // Optionally trigger a custom event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-change'));
  }
  return data;
};

// ─────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────
export const logout = async () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    // Optionally trigger a custom event
    window.dispatchEvent(new Event('auth-change'));
  }
};

// ─────────────────────────────────────────────
// Auth state listener
// ─────────────────────────────────────────────
export const onAuthStateChange = (
  callback: (event: string, session: any) => void,
) => {
  if (typeof window === 'undefined') return { data: { subscription: { unsubscribe: () => {} } } };
  
  const listener = () => {
    callback('STATE_CHANGE', getSession());
  };
  
  window.addEventListener('auth-change', listener);
  window.addEventListener('storage', (e) => {
    if (e.key === TOKEN_KEY) listener(); // Catch cross-tab auth sync
  });
  
  return {
    data: {
      subscription: {
        unsubscribe: () => {
          window.removeEventListener('auth-change', listener);
          // (Would remove storage listener if named function was used)
        }
      }
    }
  };
};
