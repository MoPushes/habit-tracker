import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

type Props = {
  onSubmit?: (email: string, password: string) => void | Promise<void>;
  error?: string | null;
};

/* ============================================================
   Pick ONE of these as your default export, or import the
   variant you want by name. They all share the same props.
   ============================================================ */

export default LoginA;
// export default LoginB;
// export default LoginC;


/* ─────────────────────────────────────────────────────────────
   A · STREAK WALL — product-as-welcome
   ───────────────────────────────────────────────────────────── */
export function LoginA({ onSubmit, error }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Deterministic contribution-grid pattern.
  const cols = 38, rows = 7;
  const cells: number[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const n = Math.sin(x * 0.42) * Math.cos(y * 0.6)
              + Math.sin((x + y * 2) * 0.18) * 0.7
              + ((x * 17 + y * 31) % 23) / 23 * 0.5;
      const recency = x > cols - 6 ? 0.45 : 0;
      const v = Math.max(0, Math.min(1, 0.35 + n * 0.35 + recency));
      cells.push(v < 0.25 ? 0 : v < 0.45 ? 1 : v < 0.65 ? 2 : v < 0.82 ? 3 : 4);
    }
  }
  cells[cells.length - 1] = 5; // today

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
          <p className="vA-eyebrow">Day 184 · Tuesday</p>
          <h1 className="vA-title">Show up.</h1>
          <p className="vA-sub">
            You've checked in <b>184 days</b> in a row. Don't break the chain.
          </p>

          <form className="vA-formfields" onSubmit={handle}>
            <label className="vA-field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="vA-field">
              <span>Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            {error && <p className="vA-error">{error}</p>}
            <div className="vA-actions">
              <button className="vA-btn" type="submit">
                Check in <span className="vA-arrow">→</span>
              </button>
              <Link to="/forgot" className="vA-link">Forgot password</Link>
            </div>
          </form>

          <p className="vA-foot">
            New here? <Link to="/register">Start day one.</Link>
          </p>
        </div>
      </main>

      <footer className="vA-bottom">
        <span>last opened · Sun 09:42</span>
        <span className="vA-legend">
          less <i className="vA-l0" /><i className="vA-l1" /><i className="vA-l2" /><i className="vA-l3" /><i className="vA-l4" /> more
        </span>
      </footer>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────
   B · BIG NUMBER — editorial split
   ───────────────────────────────────────────────────────────── */
export function LoginB({ onSubmit, error }: Props) {
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
          <p className="vB-kicker">Today is day</p>
          <h1 className="vB-num">184</h1>
          <p className="vB-caption">of showing up — the longest streak you've ever kept.</p>
        </div>

        <blockquote className="vB-quote">
          <p>“We are what we repeatedly do.”</p>
          <cite>— Aristotle, paraphrased</cite>
        </blockquote>
      </section>

      <section className="vB-right">
        <div className="vB-form">
          <p className="vB-tag">Sign in</p>
          <h2 className="vB-welcome">Pick up where you left off.</h2>

          <form onSubmit={handle}>
            <div className="vB-field">
              <label htmlFor="vb-email">Email</label>
              <input id="vb-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="vB-field">
              <label htmlFor="vb-pw">
                Password <Link to="/forgot">forgot?</Link>
              </label>
              <input id="vb-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="vB-error">{error}</p>}
            <button className="vB-btn" type="submit">Continue →</button>
          </form>

          <p className="vB-alt">
            No account yet? <Link to="/register">Create one</Link>
          </p>
        </div>
      </section>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────
   C · HABIT LEDGER — analog ritual
   ───────────────────────────────────────────────────────────── */
export function LoginC({ onSubmit, error }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handle = (e: FormEvent) => { e.preventDefault(); onSubmit?.(email, password); };

  return (
    <div className="vC">
      <div className="vC-rules" aria-hidden="true" />

      <header className="vC-head">
        <div className="vC-corner-l">
          <span className="vC-no">No. 1,847</span>
          <span className="vC-no-sub">entry</span>
        </div>
        <div className="vC-corner-r">
          <span className="vC-no">14 · v · 26</span>
          <span className="vC-no-sub">tuesday</span>
        </div>
      </header>

      <main className="vC-main">
        <h1 className="vC-title">The <em>habit</em> ledger.</h1>
        <p className="vC-sub">
          A quiet place to record showing up. Sign your name to continue.
        </p>

        <form className="vC-form" onSubmit={handle}>
          <div className="vC-row">
            <label htmlFor="vc-email">signed,</label>
            <input id="vc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="vC-row">
            <label htmlFor="vc-pw">passphrase</label>
            <input id="vc-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && <p className="vC-error">{error}</p>}
          <div className="vC-foot">
            <button type="submit" className="vC-seal">
              <span>Open<br />ledger</span>
            </button>
            <div className="vC-foot-meta">
              <p>184 consecutive entries</p>
              <p>last sealed · two days ago</p>
              <p>not yet enrolled? <Link to="/register">begin</Link></p>
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
