import { useState, useEffect, useRef } from 'react';
import './reminders.css';

/* ============================================================
   Reminder UI — drop-in components for the Habits page.

   Exports:
     - ReminderEditor   (the shared editor body — time + freq + days)
     - HabitBell        (the chip on each habit row — opens popover)
     - InlineReminder   (the section inside the Add-habit form)
     - Reminder, FREQ_TO_DAYS, formatTime, summarizeFreq  (types + helpers)
   ============================================================ */

export type Freq = 'daily' | 'weekdays' | 'weekends' | 'custom';
export type Reminder = {
  time: string;        // 'HH:MM' (24h)
  freq: Freq;
  days: number[];      // 0=Sun … 6=Sat
};

export const FREQ_TO_DAYS: Record<Exclude<Freq, 'custom'>, number[]> = {
  daily:    [0, 1, 2, 3, 4, 5, 6],
  weekdays: [1, 2, 3, 4, 5],
  weekends: [0, 6],
};

export const DEFAULT_REMINDER: Reminder = {
  time: '09:00',
  freq: 'daily',
  days: FREQ_TO_DAYS.daily,
};

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export function formatTime(t: string): string {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const hr = ((h + 11) % 12) + 1;
  return `${hr}:${String(m).padStart(2, '0')} ${period}`;
}

export function summarizeFreq(r: Reminder | null): string {
  if (!r) return '';
  if (r.freq === 'daily')    return 'Every day';
  if (r.freq === 'weekdays') return 'Weekdays';
  if (r.freq === 'weekends') return 'Weekends';
  if (!r.days?.length) return 'No days';
  if (r.days.length === 7) return 'Every day';
  const order = [1, 2, 3, 4, 5, 6, 0];
  const labels: Record<number, string> = { 0:'Sun', 1:'Mon', 2:'Tue', 3:'Wed', 4:'Thu', 5:'Fri', 6:'Sat' };
  return order.filter(d => r.days.includes(d)).map(d => labels[d]).join(' · ');
}

/* ---------- Icons ---------- */
const Bell = ({ filled = false, size = 13 }: { filled?: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={filled ? 'currentColor' : 'none'}
       stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11h8a3 3 0 0 1-3-3V6a3 3 0 1 0-6 0v2a3 3 0 0 1-3 3z" transform="translate(2,0)" />
    <path d="M6.5 13.5a1.5 1.5 0 0 0 3 0" fill="none" />
  </svg>
);
const Plus = () => (
  <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
    <path d="M8 3v10M3 8h10" />
  </svg>
);
const XIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);
const EditIcon = () => (
  <svg width={12} height={12} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.5 2.5l2 2L5 13l-2.5.5L3 11l8.5-8.5z" />
  </svg>
);
const TrashIcon = () => (
  <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 4h10M6 4V2.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V4M4.5 4l.5 9a1 1 0 0 0 1 .9h4a1 1 0 0 0 1-.9l.5-9" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   ReminderEditor — shared body. Used in popover + inline.
   ───────────────────────────────────────────────────────────── */
type EditorProps = {
  value: Reminder | null;
  onChange: (r: Reminder) => void;
  onRemove?: () => void;
  onCancel?: () => void;
  onDone?: () => void;
  showHeader?: boolean;
  showRemoveAlways?: boolean;
};

export function ReminderEditor({
  value, onChange, onRemove, onCancel, onDone,
  showHeader = true, showRemoveAlways = false,
}: EditorProps) {
  const [draft, setDraft] = useState<Reminder>(value ?? DEFAULT_REMINDER);
  useEffect(() => { setDraft(value ?? DEFAULT_REMINDER); }, [value]);

  const setFreq = (freq: Freq) => {
    if (freq === 'custom') {
      setDraft({ ...draft, freq, days: draft.days.length ? draft.days : [...FREQ_TO_DAYS.daily] });
    } else {
      setDraft({ ...draft, freq, days: FREQ_TO_DAYS[freq] });
    }
  };
  const toggleDay = (d: number) => {
    const days = draft.days.includes(d) ? draft.days.filter(x => x !== d) : [...draft.days, d];
    setDraft({ ...draft, freq: 'custom', days });
  };
  const save = () => { onChange(draft); onDone?.(); };

  return (
    <>
      {showHeader && (
        <div className="rem-head">
          <span className="rem-title">Reminder</span>
          {onCancel && (
            <button className="rem-close" type="button" onClick={onCancel} aria-label="Close">
              <XIcon />
            </button>
          )}
        </div>
      )}

      <div className="rem-time-row">
        <span className="rem-time-label">Time</span>
        <input type="time" className="rem-time"
               value={draft.time}
               onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
      </div>

      <p className="rem-section-label">Repeat</p>
      <div className="rem-segs">
        {(['daily', 'weekdays', 'weekends', 'custom'] as const).map(f => (
          <button key={f} type="button"
                  className={"rem-seg" + (draft.freq === f ? " is-active" : "")}
                  onClick={() => setFreq(f)}>
            {f === 'daily' ? 'Every day' :
             f === 'weekdays' ? 'Weekdays' :
             f === 'weekends' ? 'Weekends' : 'Specific days'}
          </button>
        ))}
      </div>

      {draft.freq === 'custom' && (
        <div className="rem-days">
          {DAY_LETTERS.map((lbl, i) => (
            <button key={i} type="button"
                    className={"rem-day" + (draft.days.includes(i) ? " is-on" : "")}
                    onClick={() => toggleDay(i)}
                    aria-label={DAY_NAMES[i]}>
              {lbl}
            </button>
          ))}
        </div>
      )}

      <div className="rem-actions">
        {(value || showRemoveAlways) ? (
          <button type="button" className="btn btn-ghost btn-sm"
                  onClick={() => { onRemove?.(); onDone?.(); }}>
            <TrashIcon /> Remove
          </button>
        ) : <span />}
        <div className="rem-actions-right">
          {onCancel && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
          )}
          <button type="button" className="btn btn-primary btn-sm" onClick={save}>
            {value ? 'Save' : 'Set reminder'}
          </button>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   HabitBell — chip on each habit row. Empty = "+", set = time pill.
   Opens popover; click outside or Esc to dismiss.
   ───────────────────────────────────────────────────────────── */
type BellProps = {
  reminder: Reminder | null;
  onChange: (r: Reminder) => void;
  onRemove: () => void;
};

export function HabitBell({ reminder, onChange, onRemove }: BellProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const anchorRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const openPopover = () => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (
        anchorRef.current && !anchorRef.current.contains(e.target as Node) &&
        popRef.current && !popRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <div className="rem-anchor" ref={anchorRef}>
      <button type="button"
              className={"habit-bell" + (reminder ? " is-set" : "")}
              onClick={openPopover}
              aria-label={reminder
                ? `Edit reminder, ${formatTime(reminder.time)} ${summarizeFreq(reminder)}`
                : "Add reminder"}>
        <Bell filled={!!reminder} />
        <span className="habit-bell-time">
          {reminder ? formatTime(reminder.time) : 'Remind'}
        </span>
      </button>

      {open && (
        <div
          ref={popRef}
          className="rem-pop"
          role="dialog"
          aria-label="Reminder"
          style={{
            position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999,
            background: 'var(--bg2, #ffffff)',
            border: '1px solid var(--border, rgba(0,0,0,0.15))',
            boxShadow: '0 12px 32px -8px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <ReminderEditor
            value={reminder}
            onChange={onChange}
            onRemove={onRemove}
            onCancel={() => setOpen(false)}
            onDone={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   InlineReminder — the section inside the Add-habit form.
   Three states: button → editor → chip.
   ───────────────────────────────────────────────────────────── */
type InlineProps = {
  value: Reminder | null;
  onChange: (r: Reminder | null) => void;
};

export function InlineReminder({ value, onChange }: InlineProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rem-inline">
        <div className="rem-inline-head">
          <span className="rem-inline-title"><Bell filled /> Reminder</span>
        </div>
        <ReminderEditor
          value={value}
          showHeader={false}
          showRemoveAlways={!!value}
          onChange={onChange}
          onRemove={() => onChange(null)}
          onCancel={() => setEditing(false)}
          onDone={() => setEditing(false)}
        />
      </div>
    );
  }

  if (value) {
    return (
      <div className="rem-set-chip">
        <Bell filled />
        <span className="rem-set-chip-time">{formatTime(value.time)}</span>
        <span className="rem-set-chip-sep">·</span>
        <span>{summarizeFreq(value)}</span>
        <button type="button" className="rem-set-chip-edit" onClick={() => setEditing(true)}>
          <EditIcon /> Edit
        </button>
      </div>
    );
  }

  return (
    <button type="button" className="rem-add" onClick={() => setEditing(true)}>
      <Plus /> Add reminder
    </button>
  );
}
