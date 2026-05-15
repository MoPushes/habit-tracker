import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';

type Props = {
  onSubmit?: (email: string, password: string) => void | Promise<void>;
  error?: string | null;
};

export default function Register({ onSubmit, error }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [matchError, setMatchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handle(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setMatchError('Passwords do not match');
      return;
    }
    setMatchError(null);
    setLoading(true);
    try {
      await onSubmit?.(email, password);
    } finally {
      setLoading(false);
    }
  }

  const displayError = matchError ?? error;

  return (
    <div className="reg-root">
      <div className="reg-left">
        <div className="reg-brand">
          <div className="reg-logo">h</div>
          <span>Habito</span>
        </div>
        <div className="reg-pitch">
          <h1>Build habits<br />that stick.</h1>
          <p>Track your daily habits, keep your streak alive, and become who you want to be.</p>
        </div>
        <ul className="reg-features">
          <li><span className="reg-check">✓</span> Daily habit tracking</li>
          <li><span className="reg-check">✓</span> Streak protection</li>
          <li><span className="reg-check">✓</span> Smart reminders</li>
        </ul>
      </div>

      <div className="reg-right">
        <div className="reg-card">
          <div className="reg-card-header">
            <h2>Create your account</h2>
            <p>Already have one? <Link to="/login">Sign in</Link></p>
          </div>

          <form className="reg-form" onSubmit={handle} noValidate>
            <div className="reg-field">
              <label htmlFor="reg-email">Email address</label>
              <input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="reg-field">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="reg-field">
              <label htmlFor="reg-confirm">Confirm password</label>
              <input
                id="reg-confirm"
                type="password"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            {displayError && (
              <div className="reg-error">{displayError}</div>
            )}

            <button className="reg-btn" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}