import { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import HabitsPage from './pages/Habits';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function usePersisted<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [val, setVal] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key);
      if (s !== null) return JSON.parse(s);
    } catch { /* ignore */ }
    return initial;
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
  }, [key, val]);
  return [val, setVal];
}

export default function App() {
  const [dark, setDark] = usePersisted('hf_dark', true);

  useEffect(() => {
    document.body.className = dark ? 'dark' : 'light';
  }, [dark]);

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route index element={<Navigate to="/habits" replace />} />
        <Route path="/habits" element={
          <ProtectedRoute>
            <HabitsPage dark={dark} onToggleDark={() => setDark((d) => !d)} />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}
