import { useEffect, useState, FormEvent } from 'react';
import { JAVA_API, authFetch, type Habit } from '../api';

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('build');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editType, setEditType] = useState('build');

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
      body: JSON.stringify({ name: newName, description: newDesc, type: newType }),
    });
    if (!res.ok) return;
    setNewName('');
    setNewDesc('');
    setNewType('build');
    fetchHabits();
  }

  function startEdit(habit: Habit) {
    setEditingId(habit.id);
    setEditName(habit.name);
    setEditDesc(habit.description ?? '');
    setEditType((habit as any).type || 'build');
  }

  async function saveEdit(id: number) {
    const res = await authFetch(`${JAVA_API}/api/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: editName, description: editDesc, type: editType }),
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
        <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="build">Build Habit (Good)</option>
          <option value="bad">Bad Habit (To Avoid)</option>
        </select>
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
                <select value={editType} onChange={(e) => setEditType(e.target.value)}>
                  <option value="build">Build</option>
                  <option value="bad">Bad</option>
                </select>
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
                <span style={{
                  marginLeft: '8px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  backgroundColor: (h as any).type === 'bad' ? '#ffebee' : '#e8f5e9',
                  color: (h as any).type === 'bad' ? '#c62828' : '#2e7d32',
                  fontWeight: 'bold'
                }}>
                  {(h as any).type === 'bad' ? 'Bad' : 'Build'}
                </span>
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