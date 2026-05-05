import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import HabitsPage from './pages/Habits';
import RemindersPage from './pages/Reminders';

export default function App() {
  return (
    <div className="app">
      <nav>
        <NavLink to="/habits">Habits</NavLink>
        <NavLink to="/reminders">Reminders</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/habits" replace />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
      </Routes>
    </div>
  );
}
