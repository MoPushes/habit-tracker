import { useEffect, useState } from 'react';
import { NODE_API, type Reminder } from '../api';

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${NODE_API}/reminders`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setReminders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <h1>Reminders</h1>
      <p className="muted">From the Node service on :3000</p>
      {loading && <p>Loading…</p>}
      {error && <p className="error">Error: {error}</p>}
      <ul>
        {reminders.map((r) => (
          <li key={r.id}>{r.text}</li>
        ))}
      </ul>
    </section>
  );
}
