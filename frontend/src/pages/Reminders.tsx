// Reminders.tsx
import { useEffect, useRef, useState } from 'react';
import { NODE_API, authFetch, type Reminder } from '../api';


interface NotificationMessage {
  type: 'NOTIFICATION';
  reminder: {
    id: number;
    text: string;
    time: string;
    type: 'good' | 'bad';
    triggeredAt: string;
  };
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationMessage['reminder'][]>([]);

  // Form state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newType, setNewType] = useState<'good' | 'bad'>('good');

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editType, setEditType] = useState<'good' | 'bad'>('good');

  const wsRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `ws://localhost:3001`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Connected to notification server');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NOTIFICATION') {
          setNotifications((prev) => [data.reminder, ...prev].slice(0, 10));

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Reminder!', {
              body: data.reminder.text,
              icon: '/reminder-icon.png',
            });
          }
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message', e);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('Disconnected from notification server');
      // Simple reconnection attempt
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
           // In a real app, you'd trigger a reconnect function here
        }
      }, 5000);
    };



    return () => {
      wsRef.current?.close();
    };
  }, []);

  //Notification permission request on first interaction
useEffect(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    // Request permission on user interaction instead of on mount
    const requestPermission = async () => {
      const permission = await Notification.requestPermission();
      if (permission === 'denied') {
        console.warn('Notification permission denied');
      }
    };
    
    // Request on first user interaction
    const handleClick = () => requestPermission();
    document.addEventListener('click', handleClick, { once: true });
    
    return () => document.removeEventListener('click', handleClick);
  }
}, []);
  // Fetch reminders on mount
  useEffect(() => {
    authFetch(`${NODE_API}/reminders`) // ✅ Uses authFetch (adds token)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setReminders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Create reminder handler
  const createReminder = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await authFetch(`${NODE_API}/reminders`, { // ✅ Uses authFetch
        method: 'POST',
        body: JSON.stringify({
          // ❌ REMOVE userId: 'user1' here!
          text: newName,
          time: newTime,
          type: newType,
          description: newDesc,
        }),
      });

      if (!res.ok) throw new Error('Failed to create reminder');

      const updated = await res.json();
      setReminders([...reminders, updated]);

      setNewName('');
      setNewDesc('');
      setNewTime('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Delete reminder handler
  const deleteReminder = async (id: number) => {
  try {
    const res = await authFetch(`${NODE_API}/reminders/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Failed to delete');

    setReminders(reminders.filter((r) => r.id !== id));
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  }
};

  // Start edit
  const startEdit = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setEditName(reminder.text);
    setEditDesc(reminder.description || '');
    setEditTime(reminder.time);
    setEditType(reminder.type);
  };

  // Save edit
const saveEdit = async (id: number) => {
  try {
    const res = await authFetch(`${NODE_API}/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        text: editName,
        description: editDesc,
        time: editTime,
        type: editType,
      }),
    });

    if (!res.ok) throw new Error('Failed to update reminder');

    const updated = await res.json();
    setReminders(reminders.map((r) => (r.id === id ? updated : r)));
    setEditingId(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  }
};

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <section>
      <h1>Reminders</h1>

{/* Add this button */}
{Notification.permission === 'default' && (
  <button 
    onClick={async () => {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') alert('Notifications enabled!');
    }}
    style={{ marginBottom: '10px', padding: '5px 10px', cursor: 'pointer' }}
  >
    🔔 Enable Notifications
  </button>
)}
      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <div className="notifications-panel">
          <h3>Recent Notifications</h3>
          <ul>
            {notifications.map((notif, index) => (
              <li key={index} className="notification-item">
                <span className={`badge ${notif.type}`}>
                  {notif.type === 'bad' ? '⚠️' : '✅'}
                </span>
                <strong>{notif.text}</strong>
                <small>Triggered at {new Date(notif.triggeredAt).toLocaleTimeString()}</small>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add Reminder Form */}
      <form className="reminder-form" onSubmit={createReminder}>
        <input
          placeholder="Reminder name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          required
        />
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as 'good' | 'bad')}
        >
          <option value="good">Good Habit</option>
          <option value="bad">Bad Habit (-5 min)</option>
        </select>
        <input
          placeholder="Description (optional)"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
        />
        <button type="submit">Add Reminder</button>
      </form>

      {/* Reminders List */}
      {!reminders.length && <p className="muted">No reminders yet. Add one above.</p>}

      <ul>
        {reminders.map((r) => (
          editingId === r.id ? (
            <li key={r.id} className="reminder-item">
              <div className="reminder-edit">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Name"
                />
                <input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Description"
                />
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                />
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as 'good' | 'bad')}
                >
                  <option value="good">Good Habit</option>
                  <option value="bad">Bad Habit (-5 min)</option>
                </select>
              </div>
              <div className="reminder-actions">
                <button onClick={() => saveEdit(r.id)}>Save</button>
                <button
                  className="btn-secondary"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </button>
              </div>
            </li>
          ) : (
            <li key={r.id} className="reminder-item">
              <div>
                <strong>{r.text}</strong>

                {r.description && (
                  <p className="muted" style={{ fontSize: '0.9em', margin: '4px 0' }}>
                    {r.description}
                  </p>
                )}
                <span className={`badge ${r.type}`}>
                  {r.type === 'bad' ? '⚠️' : '✅'} {r.time}
                </span>
              </div>
              <div className="reminder-actions">
                <button
                  className="btn-secondary"
                  onClick={() => startEdit(r)}
                >
                  Edit
                </button>
                <button
                  className="btn-danger"
                  onClick={() => deleteReminder(r.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          )
        ))}
      </ul>
    </section>
  );
}