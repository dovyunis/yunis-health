import { useEffect, useState, FormEvent } from 'react';
import { api } from '../api/client';

interface TodoItem {
  id: string;
  title: string;
  completedAt: string | null;
}

export default function Todos() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [title, setTitle] = useState('');

  async function load() {
    const { data } = await api.get('/todos');
    setTodos(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post('/todos', { title });
    setTitle('');
    load();
  }

  async function complete(id: string) {
    await api.patch(`/todos/${id}/complete`);
    load();
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <form onSubmit={add} className="bg-white rounded-xl shadow-sm p-4 flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="New reminder…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="bg-brand-500 text-white rounded px-4">Add</button>
      </form>
      <div className="space-y-2">
        {todos.map((t) => (
          <div key={t.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
            <input type="checkbox" checked={!!t.completedAt} onChange={() => !t.completedAt && complete(t.id)} />
            <span className={t.completedAt ? 'line-through text-slate-400' : 'text-slate-800'}>{t.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
