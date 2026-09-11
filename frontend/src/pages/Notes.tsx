import { useEffect, useState, FormEvent } from 'react';
import { api } from '../api/client';

interface Note {
  id: string;
  noteText: string;
  createdAt: string;
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState('');

  async function load() {
    const { data } = await api.get('/notes');
    setNotes(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await api.post('/notes', { noteText: text });
    setText('');
    load();
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <form onSubmit={add} className="bg-white rounded-xl shadow-sm p-4 flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="How are you feeling today?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="bg-brand-500 text-white rounded px-4">Add</button>
      </form>
      <div className="space-y-2">
        {notes.map((n) => (
          <div key={n.id} className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-slate-800">{n.noteText}</p>
            <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
