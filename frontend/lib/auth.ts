'use client';

// Mock credentials
export const MOCK_CREDENTIALS = {
  email: 'test@hdfoods.com',
  password: 'password123'
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('hd_foods_auth') === 'true';
};

export const login = (email: string, password: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
    localStorage.setItem('hd_foods_auth', 'true');
    return true;
  }
  return false;
};

export const logout = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('hd_foods_auth');
};

export const signup = (name: string, email: string) => {
  if (typeof window === 'undefined') return;
  // For demo, signup just logs them in
  localStorage.setItem('hd_foods_auth', 'true');
};
