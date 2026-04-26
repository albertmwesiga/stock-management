import { api, setToken, setUser, removeToken, getUser } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'DRIVER' | 'STOCK_MANAGER' | 'SALES_MANAGER' | 'DIRECTOR';
}

export async function login(email: string, password: string): Promise<User> {
  const response = await api.post<{ accessToken: string; user: User }>('/auth/login', {
    email,
    password,
  });
  setToken(response.accessToken);
  setUser(response.user);
  return response.user;
}

export function logout() {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export { getUser };

export function getRoleRedirect(role: string): string {
  switch (role) {
    case 'DRIVER': return '/driver/journey';
    case 'STOCK_MANAGER': return '/stock/receive';
    case 'SALES_MANAGER': return '/sales/collections';
    case 'DIRECTOR': return '/director/dashboard';
    default: return '/login';
  }
}
