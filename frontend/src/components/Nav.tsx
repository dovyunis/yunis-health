import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="font-semibold text-brand-700">Yunis Health</div>
      <div className="flex gap-4 text-sm text-slate-600 items-center">
        <Link to="/">Dashboard</Link>
        <Link to="/notes">Notes</Link>
        <Link to="/todos">To-Do</Link>
        <Link to="/settings">Settings</Link>
        <span className="text-slate-300">|</span>
        <span>{user?.email}</span>
        <button
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
          className="text-brand-600 hover:underline"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
