import { useEffect, useState, FormEvent, useRef } from 'react';
import { JAVA_API, NODE_API, authFetch, type Habit, type Reminder } from '../api';

export default function MainPage() {
  // --- STATE ---
  const [habits, setHabits] = useState<Habit[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // --- FORM STATE ---
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  
  // Reminder toggle & inputs
  const [showReminder, setShowReminder] = useState(false);
  const [newRTime, setNewRTime] = useState('');
  const [newRType, setNewRType] = useState<'good' | 'bad'>('good');

  // Edit states
  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);
  const [editHabitName, setEditHabitName] = useState('');
  const [editHabitDesc, setEditHabitDesc] = useState('');
  
  const [editingRId, setEditingRId] = useState<number | null>(null);
  const [editRName, setEditRName] = useState('');
  const [editRTime, setEditRTime] = useState('');
  const [editRType, setEditRType] = useState<'good' | 'bad'>('good');
  const [editRDesc, setEditRDesc] = useState('');

  // --- FETCH ---
  async function fetchData() {
    try {
      const [hRes, rRes] = await Promise.all([
        authFetch(`${JAVA_API}/api/habits`),
        fetch(`${NODE_API}/reminders`)
      ]);
      if (!hRes.ok || !rRes.ok) throw new Error("Failed to fetch data");
      setHabits(await hRes.json());
      setReminders(await rRes.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  // --- WEBSOCKET ---
  useEffect(() => {
    wsRef.current = new WebSocket('ws://localhost:3001');
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NOTIFICATION') {
        setNotifications(prev => [data.reminder, ...prev].slice(0, 5));
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Reminder!', { body: data.reminder.text });
        }
      }
    };
    return () => wsRef.current?.close();
  }, []);

  // --- CREATE LOGIC ---
  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setLoading(true);
    try {
      // 1. Always create Habit
      const habitRes = await authFetch(`${JAVA_API}/api/habits`, {
        method: 'POST',
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      if (!habitRes.ok) throw new Error("Failed to create habit");

      // 2. Only create Reminder if checkbox is checked AND time is filled
      if (showReminder && newRTime) {
        await fetch(`${NODE_API}/reminders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'user1',
            text: newName,
            time: newRTime,
            type: newRType,
            description: newDesc || `Reminder for: ${newName}`,
          }),
        });
      }

      // Reset Form
      setNewName('');
      setNewDesc('');
      setShowReminder(false);
      setNewRTime('');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- EDIT/DELETE ---
  async function saveHabitEdit(id: number) {
    await authFetch(`${JAVA_API}/api/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: editHabitName, description: editHabitDesc }),
    });
    setEditingHabitId(null);
    fetchData();
  }

  async function deleteHabit(id: number) {
    await authFetch(`${JAVA_API}/api/habits/${id}`, { method: 'DELETE' });
    fetchData();
  }

  async function saveReminderEdit(id: number) {
    await fetch(`${NODE_API}/reminders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editRName, time: editRTime, type: editRType, description: editRDesc }),
    });
    setEditingRId(null);
    fetchData();
  }

  async function deleteReminder(id: number) {
    await fetch(`${NODE_API}/reminders/${id}`, { method: 'DELETE' });
    fetchData();
  }

  if (loading && habits.length === 0 && reminders.length === 0) return <p>Loading...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <section>
      <h1>Habit Tracker</h1>

      {/* NOTIFICATIONS */}
      {notifications.length > 0 && (
        <div className="unified-form">
          <h3>Recent Alerts</h3>
          <ul>
            {notifications.map((n, i) => (
              <li key={i} className="muted">
                <span className={n.type === 'bad' ? 'text-red' : 'text-green'}>
                  {n.type === 'bad' ? '⚠️' : '✅'} {n.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* MAIN ADD FORM */}
      <div className="unified-form">
        <h2>Add New Habit</h2>
        <form onSubmit={handleCreate}>
          {/* Standard Habit Inputs */}
          <div className="habit-form" style={{ flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
            <input
              placeholder="Habit Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <input
              placeholder="Description (Optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>

          {/* Optional Reminder Toggle */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={showReminder}
                onChange={(e) => setShowReminder(e.target.checked)}
              />
              <span>Add a reminder for this habit?</span>
            </label>
          </div>

          {/* Conditional Reminder Inputs - Only shows if checked */}
          {showReminder && (
            <div className="reminder-options">
              <input
                type="time"
                value={newRTime}
                onChange={(e) => setNewRTime(e.target.value)}
                required={showReminder} // Only required if checkbox is checked
                placeholder="Time"
              />
              <select
                value={newRType}
                onChange={(e) => setNewRType(e.target.value as any)}
              >
                <option value="good">Good Habit ✅</option>
                <option value="bad">Bad Habit ⚠️</option>
              </select>
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating...' : 'Create Habit'}
          </button>
        </form>
      </div>

      <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #dee2e6' }} />

      {/* TWO COLUMN LAYOUT */}
      <div className="two-column-grid">
        
        {/* Habits Column */}
        <div>
          <h3>My Habits</h3>
          {habits.length === 0 && <p className="muted">No habits yet.</p>}
          <ul>
            {habits.map((h) => (
              <li key={h.id} className="habit-item">
                {editingHabitId === h.id ? (
                  <div className="habit-edit">
                    <input value={editHabitName} onChange={(e) => setEditHabitName(e.target.value)} />
                    <input value={editHabitDesc} onChange={(e) => setEditHabitDesc(e.target.value)} placeholder="Description" />
                    <button onClick={() => saveHabitEdit(h.id)}>Save</button>
                    <button className="btn-secondary" onClick={() => setEditingHabitId(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div>
                      <strong>{h.name}</strong>
                      {h.description && <div className="muted">{h.description}</div>}
                    </div>
                    <div className="habit-actions">
                      <button className="btn-secondary" onClick={() => { setEditingHabitId(h.id); setEditHabitName(h.name); setEditHabitDesc(h.description || ''); }}>Edit</button>
                      <button className="btn-danger" onClick={() => deleteHabit(h.id)}>Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Reminders Column */}
        <div>
          <h3>Active Reminders</h3>
          {Notification.permission === 'default' && (
             <button className="btn-secondary" onClick={() => Notification.requestPermission()} style={{ marginBottom: '1rem', width: '100%' }}>
               🔔 Enable Notifications
             </button>
          )}
          {reminders.length === 0 && <p className="muted">No reminders set.</p>}
          <ul>
            {reminders.map((r) => (
              <li key={r.id} className="habit-item">
                {editingRId === r.id ? (
                  <div className="habit-edit">
                    <input value={editRName} onChange={(e) => setEditRName(e.target.value)} />
                    <input type="time" value={editRTime} onChange={(e) => setEditRTime(e.target.value)} />
                    <select value={editRType} onChange={(e) => setEditRType(e.target.value as any)}>
                      <option value="good">Good</option>
                      <option value="bad">Bad</option>
                    </select>
                    <input value={editRDesc} onChange={(e) => setEditRDesc(e.target.value)} placeholder="Desc" />
                    <button onClick={() => saveReminderEdit(r.id)}>Save</button>
                    <button className="btn-secondary" onClick={() => setEditingRId(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div>
                      <strong>{r.text}</strong>
                      <span className={`badge ${r.type}`} style={{ marginLeft: '0.5rem' }}>
                        {r.type === 'bad' ? '⚠️' : '✅'} {r.time}
                      </span>
                      {r.description && <div className="muted" style={{ fontSize: '0.85rem' }}>{r.description}</div>}
                    </div>
                    <div className="habit-actions">
                      <button className="btn-secondary" onClick={() => { setEditingRId(r.id); setEditRName(r.text); setEditRTime(r.time); setEditRType(r.type); setEditRDesc(r.description || ''); }}>Edit</button>
                      <button className="btn-danger" onClick={() => deleteReminder(r.id)}>Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}