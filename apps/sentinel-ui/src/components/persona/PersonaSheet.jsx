import { usePersonaStore } from '../../stores/personaStore';
import { X } from 'lucide-react';

export function PersonaSheet({ open, onClose, moods = [] }) {
  const { personaName, mood, isLocked, isSandbox, setMood } = usePersonaStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-codex border border-border rounded-lg md:rounded-2xl w-full md:w-96 max-h-[80vh] overflow-y-auto m-4 md:m-0">
        {/* Header */}
        <div className="sticky top-0 bg-codex border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="font-cinzel text-amber text-lg">DM PERSONA</h2>
          <button
            onClick={onClose}
            className="text-dust hover:text-amber transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Persona name */}
          <div>
            <div className="text-amber font-cinzel text-sm mb-2">NAME</div>
            <div className="text-ink font-medium">{personaName}</div>
          </div>

          {/* Mood selector */}
          <div>
            <div className="text-amber font-cinzel text-sm mb-3">MOOD</div>
            <div className="flex flex-wrap gap-2">
              {moods.map(m => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    mood === m
                      ? 'bg-leyline text-void'
                      : 'bg-border text-ink hover:bg-border/80'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Lock status */}
          <div className="border-t border-border pt-4">
            <div className="text-amber font-cinzel text-sm mb-2">STATUS</div>
            {isLocked ? (
              <div className="text-dust text-sm">
                🔒 Persona type is locked for this world.{' '}
                {!isSandbox && 'Enable Sandbox Mode or earn a World Event to unlock.'}
              </div>
            ) : (
              <div className="text-leyline text-sm">
                ✓ Persona type can be changed freely.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="w-full py-2 bg-border text-ink rounded hover:bg-border/80 transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
