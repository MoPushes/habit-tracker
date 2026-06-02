//habits.tsx
import { useEffect, useState, FormEvent } from 'react';
import { JAVA_API, authFetch, type Habit } from '../api';

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  async function fetchHabits() {
    try {
      const res = await authFetch(`${JAVA_API}/api/habits`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setHabits(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchHabits(); }, []);

  async function createHabit(e: FormEvent) {
    e.preventDefault();
    const res = await authFetch(`${JAVA_API}/api/habits`, {
      method: 'POST',
      body: JSON.stringify({ name: newName, description: newDesc }),
    });
    if (!res.ok) return;
    setNewName('');
    setNewDesc('');
    fetchHabits();
  }

  function startEdit(habit: Habit) {
    setEditingId(habit.id);
    setEditName(habit.name);
    setEditDesc(habit.description ?? '');
  }

  async function saveEdit(id: number) {
    const res = await authFetch(`${JAVA_API}/api/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: editName, description: editDesc }),
    });
    if (!res.ok) return;
    setEditingId(null);
    fetchHabits();
  }

  async function deleteHabit(id: number) {
    const res = await authFetch(`${JAVA_API}/api/habits/${id}`, { method: 'DELETE' });
    if (!res.ok) return;
    fetchHabits();
  }

  return (
    <section>
      <h1>Habits</h1>

      <form className="habit-form" onSubmit={createHabit}>
        <input
          placeholder="Habit name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <input
          placeholder="Description (optional)"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {loading && <p>Loading…</p>}
      {error && <p className="error">Error: {error}</p>}
      {!loading && !error && habits.length === 0 && <p className="muted">No habits yet. Add one above.</p>}

      <ul>
        {habits.map((h) =>
          editingId === h.id ? (
            <li key={h.id} className="habit-item">
              <div className="habit-edit">
                <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description" />
              </div>
              <div className="habit-actions">
                <button onClick={() => saveEdit(h.id)}>Save</button>
                <button className="btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </li>
          ) : (
            <li key={h.id} className="habit-item">
              <div>
                <strong>{h.name}</strong>
                {h.description && <div className="muted">{h.description}</div>}
              </div>
              <div className="habit-actions">
                <button className="btn-secondary" onClick={() => startEdit(h)}>Edit</button>
                <button className="btn-danger" onClick={() => deleteHabit(h.id)}>Delete</button>
              </div>
            </li>
          )
        )}
      </ul>
    </section>
  );
}