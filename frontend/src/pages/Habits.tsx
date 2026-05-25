import { useEffect, useState, FormEvent } from 'react';
import { JAVA_API, authFetch, type Habit, type HabitProgress } from '../api';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';

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

  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [progressData, setProgressData] = useState<HabitProgress | null>(null);

  async function fetchHabits() {
    try {
      const res = await authFetch(`${JAVA_API}/api/habits`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHabits(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchHabits(); }, []);

  function handleSelectHabit(habit: Habit) {
    setSelectedHabit(habit);

    const mockProgress: HabitProgress = habit.type === 'bad' ? {
      completionRate: 88,
      currentStreak: 14,
      longestStreak: 25,
      sevenDayTrend: [100, 100, 0, 100, 100, 100, 100]
    } : {
      completionRate: 74,
      currentStreak: 6,
      longestStreak: 18,
      sevenDayTrend: [0, 100, 100, 0, 100, 100, 100]
    };

    setProgressData(mockProgress);
  }

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
    setEditType(habit.type || 'build');
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
    if (selectedHabit?.id === id) {
      setSelectedHabit(null);
      setProgressData(null);
    }
    fetchHabits();
  }

  const chartData = progressData?.sevenDayTrend.map((val, index) => ({
    day: `Day ${index + 1}`,
    value: val
  })) || [];

  return (
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1>Habits</h1>

        <form className="habit-form" onSubmit={createHabit} style={{ marginBottom: '20px' }}>
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
          <select value={newType} onChange={(e) => setNewType(e.target.value as 'build' | 'bad')}>
            <option value="build">Build Habit (Good)</option>
            <option value="bad">Bad Habit (To Avoid)</option>
          </select>
          <button type="submit">Add</button>
        </form>

        {loading && <p>Loading…</p>}
        {error && <p className="error">Error: {error}</p>}
        {!loading && !error && habits.length === 0 && <p className="muted">No habits yet. Add one above.</p>}

        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          <ul style={{ flex: '1', minWidth: '320px', listStyle: 'none', padding: 0, margin: 0 }}>
            {habits.map((h) =>
                editingId === h.id ? (
                    <li key={h.id} className="habit-item" style={{ marginBottom: '12px' }}>
                      <div className="habit-edit">
                        <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                        <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description" />
                        <select value={editType} onChange={(e) => setEditType(e.target.value as 'build' | 'bad')}>
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
                    <li
                        key={h.id}
                        className="habit-item"
                        onClick={() => handleSelectHabit(h)}
                        style={{
                          marginBottom: '12px',
                          cursor: 'pointer',
                          border: selectedHabit?.id === h.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                          transition: 'all 0.2s'
                        }}
                    >
                      <div>
                        <strong>{h.name}</strong>
                        <span style={{
                          marginLeft: '8px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          backgroundColor: h.type === 'bad' ? '#ffebee' : '#e8f5e9',
                          color: h.type === 'bad' ? '#c62828' : '#2e7d32',
                          fontWeight: 'bold'
                        }}>
                    {h.type === 'bad' ? 'Bad' : 'Build'}
                  </span>
                        {h.description && <div className="muted">{h.description}</div>}
                      </div>
                      <div className="habit-actions" onClick={(e) => e.stopPropagation()}>
                        <button className="btn-secondary" onClick={() => startEdit(h)}>Edit</button>
                        <button className="btn-danger" onClick={() => deleteHabit(h.id)}>Delete</button>
                      </div>
                    </li>
                )
            )}
          </ul>

          {selectedHabit && progressData && (
              <div style={{
                flex: '1',
                minWidth: '350px',
                backgroundColor: '#f3f4f6',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#111827' }}>Analytics</h2>
                <p style={{ color: '#6b7280', margin: '0 0 24px 0', fontSize: '0.95rem' }}>{selectedHabit.name}</p>

                <div style={{ marginBottom: '20px' }}>
              <span style={{ color: '#4b5563', fontSize: '0.9rem', fontWeight: '500' }}>
                {selectedHabit.type === 'bad' ? 'Success Rate:' : 'Completion Rate:'}
              </span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', margin: '4px 0' }}>
                    {progressData.completionRate}%
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '40px', marginBottom: '30px' }}>
                  <div>
                <span style={{ color: '#4b5563', fontSize: '0.85rem', fontWeight: '500' }}>
                  {selectedHabit.type === 'bad' ? 'Avoidance Streak:' : 'Current Streak:'}
                </span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{progressData.currentStreak} days</div>
                  </div>
                  <div>
                    <span style={{ color: '#4b5563', fontSize: '0.85rem', fontWeight: '500' }}>Longest Streak:</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{progressData.longestStreak} days</div>
                  </div>
                </div>

                <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '0.9rem' }}>7 Day Trend</h4>
                <div style={{ width: '100%', height: 150 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="day" hide />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip formatter={(value) => [value === 100 ? 'Successful' : 'Missed', 'Status']} />
                      <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#3b82f6' }}
                          activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
          )}

        </div>
      </section>
  );
}