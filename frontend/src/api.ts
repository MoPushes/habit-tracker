export const JAVA_API = 'http://localhost:8081';
export const NODE_API = 'http://localhost:3000';

export type Habit = {
  id: number;
  name: string;
  description: string;
};

export type Reminder = {
  id: number;
  text: string;
};

export type AuthResponse = {
  userId: number;
  email: string;
  token: string;
};

export function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${JAVA_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
  return body;
}

export async function apiRegister(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${JAVA_API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
  return body;
}