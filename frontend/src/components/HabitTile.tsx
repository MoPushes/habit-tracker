import { useState } from 'react';
import type { DashHabit } from '../data';
import { HabitBell, summarizeFreq, type Reminder } from './Reminder';

export default function HabitTile({ habit, checked, onToggle, onReminderChange, onReminderRemove, onEdit, onDelete }: {
  habit: DashHabit;
  checked: boolean;
  onToggle: (id: number) => void;
  onReminderChange: (id: number, r: Reminder) => void;
  onReminderRemove: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const [bounce, setBounce] = useState(false);

  const handleToggle = () => {
    setBounce(true);
    setTimeout(() => setBounce(false), 400);
    onToggle(habit.id);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: checked ? `${habit.color}18` : 'var(--bg3)',
      border: `1.5px solid ${checked ? habit.color + '55' : 'var(--border)'}`,
      borderRadius: 16, transition: 'all .2s', userSelect: 'none',
      overflow: 'hidden',
    }}>
      {/* Top row — click to toggle */}
      <div onClick={handleToggle} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', cursor: 'pointer',
      }}>
        {/* Emoji / check icon */}
        <div style={{
          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
          background: checked ? habit.color : 'var(--bg4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: checked ? 16 : 20, transition: 'all .25s',
          boxShadow: checked ? `0 4px 14px ${habit.color}55` : 'none',
          animation: bounce && checked ? 'checkBounce .4s ease' : 'none',
        }}>
          {checked
            ? <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l3.5 3.5L13 4.5"/></svg>
            : habit.emoji}
        </div>

        {/* Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: 13,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            textDecoration: checked ? 'line-through' : 'none',
            color: checked ? 'var(--text2)' : 'var(--text)',
          }}>
            {habit.name}
          </div>
          {habit.description && (
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {habit.description}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row — actions */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 10px 8px',
          borderTop: `1px solid ${checked ? habit.color + '22' : 'var(--border)'}`,
        }}
      >
        {/* Reminder chip / bell */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text2)' }}>
          <HabitBell
            reminder={habit.reminder ?? null}
            onChange={(r) => onReminderChange(habit.id, r)}
            onRemove={() => onReminderRemove(habit.id)}
          />
          {habit.reminder && (
            <span style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 500 }}>
              {summarizeFreq(habit.reminder)}
            </span>
          )}
        </div>

        {/* Edit + Delete */}
        <div style={{ display: 'flex', gap: 2 }}>
          <ActionBtn title="Edit" color="var(--violet)" hoverBg="rgba(124,58,237,.1)" onClick={() => onEdit(habit.id)}>
            <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M11.5 2.5l2 2L5 13l-2.5.5L3 11l8.5-8.5z"/>
            </svg>
          </ActionBtn>
          <ActionBtn title="Delete" color="#ef4444" hoverBg="rgba(239,68,68,.1)" onClick={() => onDelete(habit.id)}>
            <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h10M6 4V2.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V4M4.5 4l.5 9a1 1 0 0 0 1 .9h4a1 1 0 0 0 1-.9l.5-9"/>
            </svg>
          </ActionBtn>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ children, title, color, hoverBg, onClick }: {
  children: React.ReactNode; title: string;
  color: string; hoverBg: string; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? hoverBg : 'transparent',
        border: 'none', cursor: 'pointer',
        color: hovered ? color : 'var(--text2)',
        padding: '4px 6px', borderRadius: 6,
        display: 'flex', alignItems: 'center',
        transition: 'color .15s, background .15s',
      }}
    >
      {children}
    </button>
  );
}
