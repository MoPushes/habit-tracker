import RingChart from './RingChart';
import HabitTile from './HabitTile';
import CalendarPanel from './CalendarPanel';
import StatsPanel from './StatsPanel';
import { PlusIco } from '../Icons';
import { TODAY, SHORT_MONTHS, type DashHabit, type TodayChecked } from '../data';
import type { Reminder } from './Reminder';

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function DashMain({ habits, todayChecked, onToggle, onAdd, zenMode, onReminderChange, onEdit, onDelete }: {
  habits: DashHabit[]; todayChecked: TodayChecked;
  onToggle: (id: number) => void; onAdd: () => void; zenMode: boolean;
  onReminderChange: (id: number, r: Reminder | null) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const doneCount = Object.values(todayChecked).filter(Boolean).length;
  const pct = habits.length ? Math.round((doneCount / habits.length) * 100) : 0;
  const msgs = ['Ready to crush it? 💪', `${doneCount} of ${habits.length} done — keep the fire! 🔥`, "You're absolutely on fire! 🎉"];
  const msgIdx = doneCount === 0 ? 0 : doneCount < habits.length ? 1 : 2;

  return (
    <div style={{ flex: 1, minWidth: 0, overflow: 'auto', padding: '0 24px 28px', background: 'var(--bg)' }}>
      <div style={{ padding: '24px 4px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{DAY_NAMES[TODAY.getDay()]}, {SHORT_MONTHS[TODAY.getMonth()]} {TODAY.getDate()}, {TODAY.getFullYear()}</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 3, lineHeight: 1.2 }}>{msgs[msgIdx]}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 100, padding: '10px 18px', flexShrink: 0 }}>
          <RingChart pct={pct} color="#7C3AED" size={42} stroke={5} showLabel={false} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--violet)' }}>{pct}%</div>
            <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 700 }}>TODAY</div>
          </div>
        </div>
      </div>

      {zenMode && (
        <div className="card" style={{ padding: 16, marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Today's Habits</div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {habits.map((h) => (
              <div key={h.id} onClick={() => onToggle(h.id)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 100, border: `1.5px solid ${todayChecked[h.id] ? h.color + '66' : 'var(--border)'}`, background: todayChecked[h.id] ? `${h.color}22` : 'var(--bg3)', cursor: 'pointer', transition: 'all .2s' }}>
                <span style={{ fontSize: 17 }}>{h.emoji}</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{h.name}</span>
                {todayChecked[h.id] && <span style={{ color: h.color, fontSize: 13 }}>✓</span>}
              </div>
            ))}
            <div onClick={onAdd} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 100, border: '1.5px dashed var(--border)', cursor: 'pointer', color: 'var(--text2)', transition: 'all .2s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.color = 'var(--violet)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--violet)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.color = 'var(--text2)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
            ><PlusIco /><span style={{ fontWeight: 700, fontSize: 13 }}>Add</span></div>
          </div>
        </div>
      )}

      {!zenMode && (
        <div className="card" style={{ padding: 22, marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Today's Habits</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
            {habits.map((h) => (
              <HabitTile
                key={h.id} habit={h} checked={!!todayChecked[h.id]} onToggle={onToggle}
                onReminderChange={onReminderChange}
                onReminderRemove={(id) => onReminderChange(id, null)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            <div onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', border: '1.5px dashed var(--border)', borderRadius: 16, cursor: 'pointer', color: 'var(--text2)', transition: 'all .2s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--violet)'; (e.currentTarget as HTMLDivElement).style.color = 'var(--violet)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.color = 'var(--text2)'; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 13, background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlusIco /></div>
              <span style={{ fontWeight: 700, fontSize: 13 }}>New habit</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18 }}>
        <CalendarPanel habits={habits} todayChecked={todayChecked} />
        <StatsPanel habits={habits} todayChecked={todayChecked} />
      </div>
    </div>
  );
}
