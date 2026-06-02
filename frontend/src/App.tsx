// app.tsx
import { NavLink, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import MainPage from './pages/MainPage';
import HabitsPage from './pages/Habits';
import RemindersPage from './pages/Reminders';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function NavBar() {
  const { user, logout } = useAuth();
  return (
    <nav>
      {user ? (
        <>
          <NavLink to="/habits">Habits</NavLink>
          <NavLink to="/reminders">Reminders</NavLink>
          <span className="nav-spacer" />
          <span className="muted nav-email">{user.email}</span>
          <button className="btn-link" onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
        </>
      )}
    </nav>
  );
}

function AppShell() {
  return (
    <div className="app">
      <NavBar />
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Full-bleed auth routes — no nav, no max-width wrapper */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
       
        {/* App shell — nav + 720px container */}
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/habits" replace />} />
          <Route path="/habits" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
          <Route path="/reminders" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}