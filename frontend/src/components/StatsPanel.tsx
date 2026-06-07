import { useState } from 'react';
import RingChart from './RingChart';
import BarChart from './BarChart';
import { TODAY, calcStreak, type DashHabit, type TodayChecked } from '../data';

export default function StatsPanel({ habits, todayChecked }: {
  habits: DashHabit[]; todayChecked: TodayChecked;
}) {
  const [active, setActive] = useState<number | undefined>(habits[0]?.id);
  const habit = habits.find((h) => h.id === active) || habits[0];
  if (!habit) return null;

  const weekData = Array.from({ length: 7 }, (_, wi) => {
    const ws = new Date(TODAY);
    ws.setDate(TODAY.getDate() - (6 - wi) * 7);
    let done = 0;
    for (let d = 0; d < 7; d++) {
      const dt = new Date(ws);
      dt.setDate(ws.getDate() + d);
      if (dt > TODAY) continue;
      const isT = dt.toDateString() === TODAY.toDateString();
      const k = `${dt.getFullYear()}-${dt.getMonth()}`;
      const day = dt.getDate();
      if (isT ? todayChecked[habit.id] : habit.completions?.[k]?.[day]) done++;
    }
    return { l: `W${wi + 1}`, v: done };
  });

  const y = TODAY.getFullYear();
  const m = TODAY.getMonth();
  const key = `${y}-${m}`;
  let done = 0;
  for (let d = 1; d <= TODAY.getDate(); d++) {
    const isT = d === TODAY.getDate();
    if (isT ? todayChecked[habit.id] : habit.completions?.[key]?.[d]) done++;
  }
  const pct = Math.round((done / TODAY.getDate()) * 100);
  const streak = calcStreak(habit, todayChecked);

  // Best streak across all stored completions, sorted chronologically.
  let best = 0, cur = 0;
  const allKeys = Object.keys(habit.completions ?? {}).sort((a, b) => {
    const [ay, am] = a.split('-').map(Number);
    const [by, bm] = b.split('-').map(Number);
    return ay !== by ? ay - by : am - bm;
  });
  for (const k of allKeys) {
    const [ky, km] = k.split('-').map(Number);
    const daysInMonth = new Date(ky, km + 1, 0).getDate();
    const maxDay = k === key ? TODAY.getDate() : daysInMonth;
    for (let d = 1; d <= maxDay; d++) {
      const isT = k === key && d === TODAY.getDate();
      const done2 = isT ? todayChecked[habit.id] : habit.completions?.[k]?.[d];
      if (done2) { cur++; best = Math.max(best, cur); } else cur = 0;
    }
  }

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Statistics</div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20, scrollbarWidth: 'none' }}>
        {habits.map((h) => (
          <button key={h.id} onClick={() => setActive(h.id)} style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px',
            borderRadius: 100, border: `1.5px solid ${active === h.id ? h.color : 'var(--border)'}`,
            background: active === h.id ? `${h.color}22` : 'var(--bg3)',
            color: 'var(--text)', cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 700, fontSize: 12,
            transition: 'all .2s',
          }}><span>{h.emoji}</span>{h.name}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 10 }}>WEEKLY COMPLETIONS</div>
          <div style={{ overflowX: 'auto' }}><BarChart data={weekData} color={habit.color} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <RingChart pct={pct} color={habit.color} size={90} stroke={9} />
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)' }}>THIS MONTH</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ background: `${habit.color}18`, border: `1.5px solid ${habit.color}44`, borderRadius: 14, padding: '10px 14px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                <span style={{ animation: 'fireWiggle 1.2s ease infinite', display: 'inline-block' }}>🔥</span>
                <span style={{ fontWeight: 900, fontSize: 22, color: habit.color }}>{streak}</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)' }}>day streak</div>
            </div>
            <div style={{ background: 'var(--bg3)', border: '1.5px solid var(--border)', borderRadius: 14, padding: '10px 14px', textAlign: 'center' }}>
              <div style={{ fontWeight: 900, fontSize: 20, color: habit.color }}>{best}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)' }}>best streak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
