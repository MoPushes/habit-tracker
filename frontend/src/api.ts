import type { Reminder as HabitReminder } from './components/Reminder';

export const JAVA_API = 'http://localhost:8081';

// Re-export the per-habit reminder shape so callers can import it from the same place.
export type { Reminder as HabitReminder } from './components/Reminder';

export type Habit = {
  id: number;
  name: string;
  description: string;
  type?: string;
  reminderTime?: string;
  reminder?: HabitReminder | null;
};

// Legacy reminder shape returned by the Node reminder service (/reminders page).
// Kept as-is so the existing read-only page keeps working.
export type Reminder = {
  id: number;
  userId: string;
  text: string;
  time: string;       // "HH:MM"
  type: 'good' | 'bad';
  description?: string;
  active: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
};

export const NODE_API = import.meta.env.VITE_NODE_API || 'http://localhost:3001';

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

/** Partial update for a habit. Supports updating only the reminder field. */
export async function patchHabit(
  id: number,
  patch: Partial<Pick<Habit, 'name' | 'description' | 'type' | 'reminderTime' | 'reminder'>>
): Promise<Habit | null> {
  const res = await authFetch(`${JAVA_API}/api/habits/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null;
  return res.json();
}
