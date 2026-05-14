import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Register from './Register';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(email: string, password: string) {
    setError(null);
    try {
      await register(email, password);
      navigate('/habits');
    } catch (err: any) {
      setError(err?.message ?? 'Registration failed');
    }
  }

  return <Register onSubmit={handleSubmit} error={error} />;
}