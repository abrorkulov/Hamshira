import { Doctor, Order, Service, User, Address } from '../types';

// Expo Go on a phone must use the computer's LAN address, not localhost.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.213.123.112:4000/api';
let accessToken: string | null = null;

export function setAccessToken(token: string | null) { accessToken = token; }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || `Server xatosi (${response.status})`);
  return body as T;
}

type AuthResult = { token: string; user: User };
export const api = {
  register: (body: { name: string; phone: string; password: string; email?: string }) =>
    request<AuthResult>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { phone: string; password: string }) =>
    request<AuthResult>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  services: () => request<Service[]>('/services'),
  doctors: async () => (await request<Doctor[]>('/doctors')).map(d => ({ ...d, rating: Number(d.rating) })),
  me: () => request<User & { addresses: Address[]; currentLocation: string }>('/me'),
  orders: () => request<Order[]>('/orders'),
  createOrder: (body: { serviceId: string; doctorId?: string; appointmentAt: string; address: string; type: Order['type'] }) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(body) }),
  cancelOrder: (id: string) => request<Order>(`/orders/${id}/cancel`, { method: 'PATCH' }),
};

export const apiBaseUrl = API_URL;
