import { usePersonaStore } from '../../stores/personaStore';
import { Menu } from 'lucide-react';

export function TopBar() {
  const { personaName, mood, isLocked } = usePersonaStore();

  return (
    <header className="bg-codex border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="font-cinzel text-2xl text-amber">⚔ SENTINEL</h1>
        <div className="text-sm text-dust">THE SHATTERED EXPANSE</div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-sm">
          <span className="text-amber font-medium">{personaName}</span>
          <span className="text-dust mx-1">•</span>
          <span className="text-dust">{mood}</span>
          <span className="ml-2">
            {isLocked ? '🔒' : '▾'}
          </span>
        </div>
        <button className="text-ink hover:text-amber transition-colors">
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}
