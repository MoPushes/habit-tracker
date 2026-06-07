import { useState } from 'react';
import { XIco } from '../Icons';
import { HABIT_COLORS } from '../data';
import { InlineReminder, type Reminder } from './Reminder';

const EMOJIS = ['⭐','🎯','💪','🏊','🚴','🎸','🌱','☕','🍎','✍️','🧠','🌟'];

export default function AddModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (data: { name: string; emoji: string; color: string; reminder: Reminder | null }) => void;
}) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('⭐');
  const [ci, setCi] = useState(0);
  const [reminder, setReminder] = useState<Reminder | null>(null);

  const submit = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), emoji, color: HABIT_COLORS[ci], reminder });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card anim-pop" style={{ width: 380, padding: 28, maxWidth: '90vw' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <span style={{ fontWeight: 900, fontSize: 18 }}>New Habit ✨</span>
          <button onClick={onClose} style={{ background: 'var(--bg3)', border: '1.5px solid var(--border)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)' }}><XIco /></button>
        </div>

        <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: 'var(--text2)', marginBottom: 7 }}>HABIT NAME</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cold Shower" autoFocus
          style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', fontFamily: 'Poppins', fontWeight: 500, fontSize: 14, outline: 'none', marginBottom: 18 }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--violet)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          onKeyDown={(e) => e.key === 'Enter' && submit()} />

        <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: 'var(--text2)', marginBottom: 9 }}>CHOOSE EMOJI</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
          {EMOJIS.map((em) => (
            <button key={em} onClick={() => setEmoji(em)} style={{ width: 38, height: 38, borderRadius: 10, border: `1.5px solid ${emoji === em ? 'var(--violet)' : 'var(--border)'}`, background: emoji === em ? 'var(--bg4)' : 'var(--bg3)', cursor: 'pointer', fontSize: 19, transition: 'all .15s' }}>{em}</button>
          ))}
        </div>

        <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: 'var(--text2)', marginBottom: 9 }}>COLOR</label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          {HABIT_COLORS.map((c, i) => (
            <button key={c} onClick={() => setCi(i)} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer', outline: ci === i ? `3px solid ${c}` : 'none', outlineOffset: 2, transform: ci === i ? 'scale(1.18)' : 'scale(1)', transition: 'all .15s' }} />
          ))}
        </div>

        <InlineReminder value={reminder} onChange={setReminder} />

        <button onClick={submit} className="btn-grad" style={{ width: '100%', justifyContent: 'center', borderRadius: 14, padding: '14px', fontSize: 15, marginTop: 22 }}>
          Create Habit 🎯
        </button>
      </div>
    </div>
  );
}
