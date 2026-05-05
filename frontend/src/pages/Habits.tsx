import { useEffect, useState } from 'react';
import { JAVA_API, type Habit } from '../api';

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${JAVA_API}/api/habits`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setHabits)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <h1>Habits</h1>
      <p className="muted">From the Spring Boot service on :8081</p>
      {loading && <p>Loading…</p>}
      {error && <p className="error">Error: {error}</p>}
      {!loading && !error && habits.length === 0 && <p>No habits yet.</p>}
      <ul>
        {habits.map((h) => (
          <li key={h.id}>
            <strong>{h.name}</strong>
            {h.description && <div className="muted">{h.description}</div>}
          </li>
        ))}
      </ul>
    </section>
  );
}
