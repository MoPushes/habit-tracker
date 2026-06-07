import { PlusIco } from '../Icons';
import { TODAY, calcStreak, type DashHabit, type TodayChecked } from '../data';

export default function Sidebar({ habits, todayChecked, onAdd }: {
  habits: DashHabit[]; todayChecked: TodayChecked; onAdd: () => void;
}) {
  const totalStreak = habits.reduce((a, h) => a + calcStreak(h, todayChecked), 0);
  const totalDone = Object.values(todayChecked).filter(Boolean).length;
  const xp = totalStreak * 12 + totalDone * 25;
  const level = Math.floor(xp / 200) + 1;
  const levelXP = xp % 200;

  return (
    <div style={{ width: 252, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, height: '100%', overflowY: 'auto', padding: '20px 0 20px 20px' }}>
      <div className="card" style={{ padding: 18, background: 'linear-gradient(135deg,rgba(124,58,237,.13),rgba(99,102,241,.13))', border: '1.5px solid rgba(124,58,237,.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 28 }}>🏆</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Level {level}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>Habit Champion</div>
          </div>
        </div>
        <div style={{ background: 'var(--bg4)', borderRadius: 100, height: 7, overflow: 'hidden' }}>
          <div style={{ width: `${(levelXP / 200) * 100}%`, height: '100%', background: 'var(--grad)', borderRadius: 100, transition: 'width .8s ease' }} />
        </div>
        <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 600, marginTop: 5 }}>{levelXP} / 200 XP</div>
      </div>

      <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 28, animation: 'fireWiggle 1.5s ease infinite', display: 'inline-block' }}>🔥</span>
        <div>
          <div style={{ fontWeight: 900, fontSize: 22, color: 'var(--violet)' }}>{totalStreak}d</div>
          <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>combined streak</div>
        </div>
      </div>

      <div className="card" style={{ padding: 16, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text3)', letterSpacing: '0.06em', marginBottom: 14 }}>MY HABITS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, overflowY: 'auto', flex: 1 }}>
          {habits.map((h) => {
            const streak = calcStreak(h, todayChecked);
            const k = `${TODAY.getFullYear()}-${TODAY.getMonth()}`;
            const vals = Object.values(h.completions?.[k] || {});
            const compPct = vals.length ? Math.round((vals.filter(Boolean).length / vals.length) * 100) : 0;
            const circ = 2 * Math.PI * 13;
            return (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ position: 'relative', width: 34, height: 34, flexShrink: 0 }}>
                  <svg width="34" height="34" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="17" cy="17" r="13" fill="none" stroke="var(--bg4)" strokeWidth="3" />
                    <circle cx="17" cy="17" r="13" fill="none" stroke={h.color} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(compPct / 100) * circ} ${circ}`} style={{ transition: 'stroke-dasharray .8s ease' }} />
                  </svg>
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{h.emoji}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 600, marginTop: 1 }}>{streak > 0 ? `🔥 ${streak}d streak` : 'Start today!'}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: h.color, flexShrink: 0 }}>{compPct}%</span>
              </div>
            );
          })}
        </div>
        <button onClick={onAdd} style={{ marginTop: 14, width: '100%', padding: '10px', borderRadius: 12, border: '1.5px dashed var(--border)', background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .2s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--violet)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--violet)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text2)'; }}
        ><PlusIco />Add Habit</button>
      </div>
    </div>
  );
}
