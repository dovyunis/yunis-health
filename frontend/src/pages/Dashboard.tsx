import { useEffect, useState } from 'react';
import { api } from '../api/client';
import StepsBarChart from '../components/StepsBarChart';

interface DailyRow {
  date: string;
  steps: number;
}

export default function Dashboard() {
  const [today, setToday] = useState<{ steps: number } | null>(null);
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [goal, setGoal] = useState(8000);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    const [meRes, todayRes, dailyRes, statusRes] = await Promise.all([
      api.get('/auth/me'),
      api.get('/activities/today'),
      api.get('/activities/daily?days=7'),
      api.get('/garmin/status'),
    ]);
    setGoal(meRes.data.stepGoal);
    setToday(todayRes.data);
    setDaily(dailyRes.data);
    setConnected(statusRes.data.connected);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function connectMock() {
    await api.post('/garmin/connect-mock');
    await loadAll();
  }

  async function syncNow() {
    await api.post('/garmin/sync');
    await loadAll();
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Loading…</div>;

  const steps = today?.steps ?? 0;
  const pct = goal > 0 ? Math.min(Math.round((steps / goal) * 100), 100) : 0;
  const metGoal = steps >= goal;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {connected === false && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 flex items-center justify-between gap-4">
          <span>Garmin isn't connected yet — using simulated data until real API access is approved.</span>
          <button onClick={connectMock} className="bg-brand-500 text-white rounded px-3 py-1.5 text-sm whitespace-nowrap">
            Connect (mock)
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-6">
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-lg font-semibold ${
            metGoal ? 'bg-emerald-500' : 'bg-brand-500'
          }`}
        >
          {pct}%
        </div>
        <div>
          <p className="text-sm text-slate-500">Today's steps</p>
          <p className="text-3xl font-bold text-slate-800">
            {steps.toLocaleString()} <span className="text-base font-normal text-slate-400">/ {goal.toLocaleString()}</span>
          </p>
          {metGoal ? (
            <p className="text-emerald-600 text-sm mt-1">🏅 Goal crushed today</p>
          ) : (
            <p className="text-slate-500 text-sm mt-1">{(goal - steps).toLocaleString()} steps to go</p>
          )}
        </div>
        {connected && (
          <button
            onClick={syncNow}
            className="ml-auto text-sm text-brand-600 border border-brand-200 rounded px-3 py-1.5 hover:bg-brand-50 whitespace-nowrap"
          >
            Sync now
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-medium text-slate-500 mb-4">This week</h2>
        <StepsBarChart data={daily} goal={goal} />
      </div>
    </div>
  );
}
