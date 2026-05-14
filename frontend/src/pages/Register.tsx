import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

type Props = {
  onSubmit?: (email: string, password: string) => void | Promise<void>;
  error?: string | null;
};

export default RegisterA;
// export default RegisterB;
// export default RegisterC;


/* ─────────────────────────────────────────────────────────────
   A · STREAK WALL
   ───────────────────────────────────────────────────────────── */
export function RegisterA({ onSubmit, error }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const cols = 38, rows = 7;
  const cells: number[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const n = Math.sin(x * 0.42) * Math.cos(y * 0.6)
              + Math.sin((x + y * 2) * 0.18) * 0.7
              + ((x * 17 + y * 31) % 23) / 23 * 0.5;
      const v = Math.max(0, Math.min(1, 0.35 + n * 0.35));
      cells.push(v < 0.25 ? 0 : v < 0.45 ? 1 : v < 0.65 ? 2 : v < 0.82 ? 3 : 4);
    }
  }

  const handle = (e: FormEvent) => { e.preventDefault(); onSubmit?.(email, password); };

  return (
    <div className="vA">
      <div className="vA-grid" aria-hidden="true">
        {cells.map((lvl, i) => <span key={i} className={`vA-cell vA-l${lvl}`} />)}
      </div>

      <header className="vA-top">
        <div className="vA-mark">h</div>
        <span className="vA-meta">Habito · v2.4</span>
      </header>

      <main className="vA-main">
        <div className="vA-form">
          <p className="vA-eyebrow">Day 1 · Tuesday</p>
          <h1 className="vA-title">Begin.</h1>
          <p className="vA-sub">
            Every streak starts with a <b>single day</b>. Make today yours.
          </p>

          <form className="vA-formfields" onSubmit={handle}>
            <label className="vA-field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </label>
            <label className="vA-field">
              <span>Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </label>
            {error && <p className="vA-error">{error}</p>}
            <div className="vA-actions">
              <button className="vA-btn" type="submit">
                Start day one <span className="vA-arrow">→</span>
              </button>
            </div>
          </form>

          <p className="vA-foot">
            Already tracking? <Link to="/login">Sign in.</Link>
          </p>
        </div>
      </main>

      <footer className="vA-bottom">
        <span>habito · your habit companion</span>
        <span className="vA-legend">
          less <i className="vA-l0" /><i className="vA-l1" /><i className="vA-l2" /><i className="vA-l3" /><i className="vA-l4" /> more
        </span>
      </footer>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────
   B · BIG NUMBER
   ───────────────────────────────────────────────────────────── */
export function RegisterB({ onSubmit, error }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handle = (e: FormEvent) => { e.preventDefault(); onSubmit?.(email, password); };

  return (
    <div className="vB">
      <section className="vB-left">
        <header className="vB-head">
          <span className="vB-stamp">Habito</span>
          <span className="vB-date">Tue · May 14</span>
        </header>

        <div className="vB-hero">
          <p className="vB-kicker">Your streak starts on</p>
          <h1 className="vB-num">1</h1>
          <p className="vB-caption">The longest journey begins with a single step. And a single day.</p>
        </div>

        <blockquote className="vB-quote">
          <p>"First forget inspiration. Habit is more dependable."</p>
          <cite>— Octavia Butler</cite>
        </blockquote>
      </section>

      <section className="vB-right">
        <div className="vB-form">
          <p className="vB-tag">Create account</p>
          <h2 className="vB-welcome">Your streak starts today.</h2>

          <form onSubmit={handle}>
            <div className="vB-field">
              <label htmlFor="vb-reg-email">Email</label>
              <input id="vb-reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="vB-field">
              <label htmlFor="vb-reg-pw">Password</label>
              <input id="vb-reg-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            {error && <p className="vB-error">{error}</p>}
            <button className="vB-btn" type="submit">Create account →</button>
          </form>

          <p className="vB-alt">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────
   C · HABIT LEDGER
   ───────────────────────────────────────────────────────────── */
export function RegisterC({ onSubmit, error }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handle = (e: FormEvent) => { e.preventDefault(); onSubmit?.(email, password); };

  return (
    <div className="vC">
      <div className="vC-rules" aria-hidden="true" />

      <header className="vC-head">
        <div className="vC-corner-l">
          <span className="vC-no">No. 1</span>
          <span className="vC-no-sub">entry</span>
        </div>
        <div className="vC-corner-r">
          <span className="vC-no">14 · v · 26</span>
          <span className="vC-no-sub">tuesday</span>
        </div>
      </header>

      <main className="vC-main">
        <h1 className="vC-title">Open a new <em>ledger.</em></h1>
        <p className="vC-sub">
          Begin your record. Sign your name to start tracking.
        </p>

        <form className="vC-form" onSubmit={handle}>
          <div className="vC-row">
            <label htmlFor="vc-reg-email">signed,</label>
            <input id="vc-reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="vC-row">
            <label htmlFor="vc-reg-pw">passphrase</label>
            <input id="vc-reg-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          {error && <p className="vC-error">{error}</p>}

          <div className="vC-foot">
            <button type="submit" className="vC-seal">
              <span>Open<br />ledger</span>
            </button>
            <div className="vC-foot-meta">
              <p>your first entry</p>
              <p>day one of many</p>
              <p>already enrolled? <Link to="/login">sign in</Link></p>
            </div>
          </div>
        </form>
      </main>

      <footer className="vC-bottom">
        <span>habito · the habit ledger</span>
        <span>est. mmxxv</span>
      </footer>
    </div>
  );
}