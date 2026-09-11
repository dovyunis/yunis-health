import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { refresh } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/login', { email, password });
      await refresh();
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={onSubmit} className="bg-white p-8 rounded-xl shadow-sm w-80 space-y-4">
        <h1 className="text-xl font-semibold text-brand-700">Yunis Health</h1>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded px-3 py-2">Log in</button>
        <p className="text-sm text-slate-500 text-center">
          No account?{' '}
          <Link to="/signup" className="text-brand-600">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
