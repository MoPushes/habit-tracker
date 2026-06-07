import { useState } from 'react';
import { ChevL, ChevR } from '../Icons';
import { TODAY, MONTHS, type DashHabit, type TodayChecked } from '../data';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CalendarPanel({ habits, todayChecked }: {
  habits: DashHabit[]; todayChecked: TodayChecked;
}) {
  const [view, setView] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const y = view.getFullYear();
  const m = view.getMonth();
  const days = new Date(y, m + 1, 0).getDate();
  const start = new Date(y, m, 1).getDay();
  const key = `${y}-${m}`;
  const canNext = new Date(y, m + 1, 1) <= TODAY;

  function score(d: number) {
    const dt = new Date(y, m, d);
    if (dt > TODAY) return -1;
    const isT = y === TODAY.getFullYear() && m === TODAY.getMonth() && d === TODAY.getDate();
    let done = 0;
    habits.forEach((h) => { if (isT ? todayChecked[h.id] : h.completions?.[key]?.[d]) done++; });
    return habits.length ? done / habits.length : 0;
  }

  function tileStyle(sc: number) {
    if (sc < 0) return { background: 'var(--bg4)', opacity: 0.3 };
    if (sc === 0) return { background: 'var(--bg4)' };
    if (sc < 0.4) return { background: 'rgba(124,58,237,.2)', border: '1px solid rgba(124,58,237,.3)' };
    if (sc < 0.7) return { background: 'rgba(124,58,237,.45)', border: '1px solid rgba(124,58,237,.5)' };
    return { background: 'var(--violet)', boxShadow: '0 2px 10px rgba(124,58,237,.4)' };
  }

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ fontWeight: 800, fontSize: 15 }}>Monthly Overview</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setView(new Date(y, m - 1, 1))} style={{ background: 'var(--bg3)', border: '1.5px solid var(--border)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)' }}><ChevL /></button>
          <span style={{ fontWeight: 700, fontSize: 13, minWidth: 112, textAlign: 'center' }}>{MONTHS[m]} {y}</span>
          <button onClick={() => canNext && setView(new Date(y, m + 1, 1))} style={{ background: 'var(--bg3)', border: '1.5px solid var(--border)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)', opacity: canNext ? 1 : 0.3 }}><ChevR /></button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5 }}>
        {DAYS.map((d) => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text3)', paddingBottom: 4 }}>{d}</div>)}
        {Array.from({ length: start }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1;
          const sc = score(d);
          const isToday = y === TODAY.getFullYear() && m === TODAY.getMonth() && d === TODAY.getDate();
          return (
            <div key={d} style={{
              ...tileStyle(sc), borderRadius: 7, aspectRatio: '1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: isToday ? 800 : 600,
              color: sc >= 0.7 ? '#fff' : 'var(--text)',
              outline: isToday ? '2.5px solid var(--violet)' : 'none', outlineOffset: 2,
              transition: 'all .2s', animation: isToday ? 'pulseRing 2s ease infinite' : 'none',
            }}>{d}</div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
        {([['var(--bg4)', 'None'], ['rgba(124,58,237,.2)', '<40%'], ['rgba(124,58,237,.45)', '<70%'], ['var(--violet)', '100%']] as [string, string][]).map(([bg, lbl]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: bg }} />
            <span style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 600 }}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
