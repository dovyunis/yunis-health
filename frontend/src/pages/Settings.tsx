import { useEffect, useState, FormEvent } from 'react';
import { api } from '../api/client';

export default function Settings() {
  const [stepGoal, setStepGoal] = useState(8000);
  const [notifyTime, setNotifyTime] = useState('18:00');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      setStepGoal(data.stepGoal);
      setNotifyTime(data.notifyTime);
    });
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    await api.put('/settings', { stepGoal: Number(stepGoal), notifyTime });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <form onSubmit={save} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h1 className="text-lg font-semibold text-slate-800">Settings</h1>
        <label className="block text-sm text-slate-600">
          Daily step goal
          <input
            type="number"
            className="w-full border rounded px-3 py-2 mt-1"
            value={stepGoal}
            onChange={(e) => setStepGoal(Number(e.target.value))}
          />
        </label>
        <label className="block text-sm text-slate-600">
          Remind me if goal isn't met by
          <input
            type="time"
            className="w-full border rounded px-3 py-2 mt-1"
            value={notifyTime}
            onChange={(e) => setNotifyTime(e.target.value)}
          />
        </label>
        <button className="bg-brand-500 hover:bg-brand-600 text-white rounded px-4 py-2">Save</button>
        {saved && <p className="text-emerald-600 text-sm">Saved</p>}
      </form>
    </div>
  );
}
