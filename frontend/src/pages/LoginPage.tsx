import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Login from './Login';

/**
 * Thin wrapper around the design-driven <Login /> component.
 * Keeps App.tsx untouched and connects the form to AuthContext.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(email: string, password: string) {
    setError(null);
    try {
      await login(email, password);
      navigate('/habits');
    } catch (err: any) {
      setError(err?.message ?? 'Login failed');
    }
  }

  return <Login onSubmit={handleSubmit} error={error} />;
}
