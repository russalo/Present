import { useState } from 'react';
import { usePersonaStore } from '../../stores/personaStore';

export function MoodDropdown({ moods = [] }) {
  const [open, setOpen] = useState(false);
  const { mood, setMood } = usePersonaStore();

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="text-dust hover:text-amber transition-colors"
      >
        {mood} ▼
      </button>

      {open && (
        <div className="absolute top-6 left-0 bg-codex border border-border rounded shadow-lg z-10">
          {moods.map(m => (
            <button
              key={m}
              onClick={() => {
                setMood(m);
                setOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-xs transition-colors ${
                mood === m
                  ? 'bg-amber text-void'
                  : 'text-ink hover:bg-border/50'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
