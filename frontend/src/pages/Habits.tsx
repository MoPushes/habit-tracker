import { useEffect, useState, useCallback } from 'react';
import { JAVA_API, authFetch, patchHabit } from '../api';
import {
  enrichHabits, loadTodayChecked, saveTodayChecked,
  saveHabitMeta,
  type DashHabit, type TodayChecked,
} from '../data';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import DashMain from '../components/DashMain';
import AddModal from '../components/AddModal';
import EditModal from '../components/EditModal';
import type { Reminder } from '../components/Reminder';

function usePersisted<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [val, setVal] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key);
      if (s !== null) return JSON.parse(s);
    } catch { /* ignore */ }
    return initial;
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
  }, [key, val]);
  return [val, setVal];
}

export default function HabitsPage({ dark, onToggleDark }: {
  dark: boolean; onToggleDark: () => void;
}) {
  const [habits, setHabits] = useState<DashHabit[]>([]);
  const [todayChecked, setTodayChecked] = useState<TodayChecked>(loadTodayChecked);
  const [layout, setLayout] = usePersisted<'sidebar' | 'zen'>('hf_layout', 'sidebar');
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<DashHabit | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchHabits() {
    try {
      const res = await authFetch(`${JAVA_API}/api/habits`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw: Array<{ id: number; name: string; description?: string }> = await res.json();
      setHabits(enrichHabits(raw));
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load habits');
    }
  }

  useEffect(() => { fetchHabits(); }, []);

  const toggle = useCallback((id: number) => {
    setTodayChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      saveTodayChecked(next);
      return next;
    });
  }, []);

  async function deleteHabit(id: number) {
    const res = await authFetch(`${JAVA_API}/api/habits/${id}`, { method: 'DELETE' });
    if (!res.ok) return;
    setHabits((hs) => hs.filter((h) => h.id !== id));
  }

  async function saveHabitEdit(id: number, data: { name: string; description: string; emoji: string; color: string }) {
    const updated = await patchHabit(id, { name: data.name, description: data.description });
    if (!updated) return;
    saveHabitMeta(id, data.emoji, data.color);
    setHabits((hs) => hs.map((h) => h.id === id ? { ...h, ...updated, emoji: data.emoji, color: data.color } : h));
  }

  async function updateHabitReminder(id: number, reminder: Reminder | null) {
    const updated = await patchHabit(id, { reminder });
    if (!updated) return;
    setHabits((hs) => hs.map((h) => (h.id === id ? { ...h, reminder } : h)));
  }

  async function addHabit(data: { name: string; emoji: string; color: string; reminder: Reminder | null }) {
    const res = await authFetch(`${JAVA_API}/api/habits`, {
      method: 'POST',
      body: JSON.stringify({ name: data.name, description: '', reminder: data.reminder }),
    });
    if (!res.ok) return;
    const created: { id: number; name: string } = await res.json();
    saveHabitMeta(created.id, data.emoji, data.color);
    await fetchHabits();
  }

  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar dark={dark} onToggleDark={onToggleDark} onAdd={() => setShowModal(true)} layout={layout} onToggleLayout={() => setLayout((l) => l === 'sidebar' ? 'zen' : 'sidebar')} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontWeight: 700 }}>Couldn't reach the API</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>{error}</div>
          <button onClick={fetchHabits} className="btn-grad" style={{ marginTop: 18, padding: '10px 24px', fontSize: 14 }}>Retry</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar dark={dark} onToggleDark={onToggleDark} onAdd={() => setShowModal(true)} layout={layout} onToggleLayout={() => setLayout((l) => l === 'sidebar' ? 'zen' : 'sidebar')} />
      <div style={{ display: 'flex', height: 'calc(100vh - 62px)', overflow: 'hidden' }}>
        {layout === 'sidebar' && (
          <div style={{ borderRight: '1.5px solid var(--border)', background: 'var(--bg2)', overflowY: 'auto', flexShrink: 0, height: '100%' }}>
            <Sidebar habits={habits} todayChecked={todayChecked} onAdd={() => setShowModal(true)} />
          </div>
        )}
        <DashMain
          habits={habits} todayChecked={todayChecked} onToggle={toggle}
          onAdd={() => setShowModal(true)} zenMode={layout === 'zen'}
          onReminderChange={updateHabitReminder}
          onEdit={(id) => setEditingHabit(habits.find((h) => h.id === id) ?? null)}
          onDelete={deleteHabit}
        />
      </div>
      {showModal && <AddModal onClose={() => setShowModal(false)} onAdd={addHabit} />}
      {editingHabit && (
        <EditModal
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onSave={(data) => saveHabitEdit(editingHabit.id, data)}
        />
      )}
    </div>
  );
}
