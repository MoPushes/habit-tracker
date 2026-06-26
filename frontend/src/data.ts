// ─── HabitFlow data layer ───────────────────────────────────

import type { Reminder } from './components/Reminder';

export const TODAY = new Date();

export const HABIT_COLORS = ['#7C3AED', '#6366F1', '#3B82F6', '#0EA5E9', '#06B6D4', '#14B8A6'];
export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/** Extended habit shape used by dashboard components */
export type DashHabit = {
  id: number;
  name: string;
  description?: string;
  emoji: string;
  color: string;
  reminder?: Reminder | null;
  type: 'good' | 'bad';
  createdDate?: string; // 'YYYY-MM-DD' — used to cap bad-habit clean streaks
  /** completions['YYYY-M'][day] = true */
  completions: Record<string, Record<number, boolean>>;
};

/** Today's check-off state: habitId → boolean */
export type TodayChecked = Record<number, boolean>;

// Deterministic pseudo-random for seeding demo-like month data.
function rng(a: number, b: number, c: number) {
  return ((a * 2654435761 + b * 40503 + c * 2246822519) >>> 0) % 100;
}

/** Generate a month of completion booleans (used when creating a new habit). */
export function genComp(id: number, y: number, m: number): Record<number, boolean> {
  const days = new Date(y, m + 1, 0).getDate();
  const out: Record<number, boolean> = {};
  for (let d = 1; d <= days; d++) {
    const dt = new Date(y, m, d);
    if (dt > TODAY) continue;
    out[d] = rng(id, d, m) < 73 + id * 2;
  }
  return out;
}

/** Current consecutive-day streak for a habit counting back from TODAY.
 *  For good habits: counts days done. For bad habits: counts clean days (no slip). */
export function calcStreak(h: DashHabit, todayChecked: TodayChecked): number {
  if (h.type === 'bad') {
    return calcCleanStreak(h, !!todayChecked[h.id]);
  }

  let s = 0;
  const dt = new Date(TODAY);
  if (!todayChecked[h.id]) {
    dt.setDate(dt.getDate() - 1);
  }
  while (s < 365) {
    const isT = dt.toDateString() === TODAY.toDateString();
    const k = `${dt.getFullYear()}-${dt.getMonth()}`;
    const d = dt.getDate();
    const done = isT ? todayChecked[h.id] : h.completions?.[k]?.[d];
    if (!done) break;
    s++;
    dt.setDate(dt.getDate() - 1);
  }
  return s;
}

/** Clean streak for a bad habit: consecutive days with no slip, capped at createdDate. */
export function calcCleanStreak(h: DashHabit, slippedToday: boolean): number {
  const created = h.createdDate ? new Date(h.createdDate) : null;
  let s = 0;
  const dt = new Date(TODAY);
  while (s < 365) {
    if (created) {
      const cur = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
      const cap = new Date(created.getFullYear(), created.getMonth(), created.getDate());
      if (cur < cap) break;
    }
    const isT = dt.toDateString() === TODAY.toDateString();
    const k = `${dt.getFullYear()}-${dt.getMonth()}`;
    const d = dt.getDate();
    const slipped = isT ? slippedToday : h.completions?.[k]?.[d];
    if (slipped) break;
    s++;
    dt.setDate(dt.getDate() - 1);
  }
  return s;
}

// ─── localStorage helpers ────────────────────────────────────

const META_KEY = 'hf_meta';      // { [id]: { emoji, color } }
const COMP_KEY = 'hf_comp';      // { [id]: completions }
const TODAY_KEY = 'hf_today_v2'; // { date: 'YYYY-MM-DD', checked: { [id]: true } }

// One-time migration: wipe fake seeded completions.
if (!localStorage.getItem('hf_cleared_v1')) {
  localStorage.removeItem(COMP_KEY);
  localStorage.setItem('hf_cleared_v1', '1');
}

type MetaMap = Record<number, { emoji: string; color: string; createdDate?: string }>;
type CompMap = Record<number, Record<string, Record<number, boolean>>>;

function readMeta(): MetaMap {
  try { return JSON.parse(localStorage.getItem(META_KEY) || '{}'); } catch { return {}; }
}
function writeMeta(m: MetaMap) {
  localStorage.setItem(META_KEY, JSON.stringify(m));
}

function readComp(): CompMap {
  try { return JSON.parse(localStorage.getItem(COMP_KEY) || '{}'); } catch { return {}; }
}
function writeComp(c: CompMap) {
  localStorage.setItem(COMP_KEY, JSON.stringify(c));
}

export function loadTodayChecked(): TodayChecked {
  try {
    const stored = JSON.parse(localStorage.getItem(TODAY_KEY) || 'null');
    const todayStr = TODAY.toISOString().slice(0, 10);
    if (stored?.date === todayStr) return stored.checked;
  } catch { /* ignore */ }
  return {};
}

export function saveTodayChecked(checked: TodayChecked) {
  localStorage.setItem(TODAY_KEY, JSON.stringify({
    date: TODAY.toISOString().slice(0, 10),
    checked,
  }));
}

/** Enrich API habits with stored emoji/color/completions. */
export function enrichHabits(
  apiHabits: Array<{ id: number; name: string; description?: string; type: string;  reminder?: Reminder | null }>,
): DashHabit[] {
  const meta = readMeta();
  const comp = readComp();
  return apiHabits.map((h, i) => {
    const m = meta[h.id] ?? { emoji: '⭐', color: HABIT_COLORS[i % HABIT_COLORS.length] };
    return { ...h, emoji: m.emoji, color: m.color, completions: comp[h.id] ?? {}, type: (h.type as 'good' | 'bad') ?? 'good', createdDate: m.createdDate };
  });
}

/** Persist emoji + color for a habit id. Pass createdDate only on first creation. */
export function saveHabitMeta(id: number, emoji: string, color: string, createdDate?: string) {
  const meta = readMeta();
  meta[id] = { emoji, color, createdDate: createdDate ?? meta[id]?.createdDate };
  writeMeta(meta);
}

/** Persist completions for a habit id. */
export function saveHabitCompletions(id: number, completions: Record<string, Record<number, boolean>>) {
  const comp = readComp();
  comp[id] = completions;
  writeComp(comp);
}

/** Remove stored meta + completions for a deleted habit. */
export function removeHabitStorage(id: number) {
  const meta = readMeta();
  const comp = readComp();
  delete meta[id];
  delete comp[id];
  writeMeta(meta);
  writeComp(comp);
}
