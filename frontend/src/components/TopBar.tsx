import { PlusIco, SunIco, MoonIco } from '../Icons';
import { useAuth } from '../auth/AuthContext';

export default function TopBar({ dark, onToggleDark, onAdd, layout, onToggleLayout }: {
  dark: boolean; onToggleDark: () => void; onAdd: () => void;
  layout: 'sidebar' | 'zen'; onToggleLayout: () => void;
}) {
  const { user, logout } = useAuth();
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'HF';

  return (
    <div style={{ height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1.5px solid var(--border)', flexShrink: 0, background: 'var(--bg2)', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔥</div>
        <span style={{ fontWeight: 900, fontSize: 18, color: 'var(--violet)' }}>HabitFlow</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onToggleLayout} className="btn-ghost" style={{ padding: '9px 14px', fontSize: 13 }}>
          {layout === 'sidebar' ? '🎯 Zen view' : '📋 Sidebar view'}
        </button>
        <button onClick={onAdd} className="btn-grad" style={{ padding: '9px 18px', fontSize: 13, borderRadius: 12 }}><PlusIco />New Habit</button>
        <button onClick={onToggleDark} style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--bg3)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)', transition: 'all .2s' }}>
          {dark ? <SunIco /> : <MoonIco />}
        </button>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#fff', cursor: 'pointer', letterSpacing: -0.5 }}
          title={user?.email} onClick={logout}>{initials}</div>
      </div>
    </div>
  );
}
