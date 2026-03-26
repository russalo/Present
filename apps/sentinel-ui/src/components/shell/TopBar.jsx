import { useState } from 'react';
import { usePersonaStore } from '../../stores/personaStore';
import { Menu, Share2 } from 'lucide-react';
import { PersonaSheet } from '../persona/PersonaSheet';
import { SeedShareModal } from '../seed/SeedShareModal';

export function TopBar({ worldName = 'The Shattered Expanse', seedString = 'ABC-DEF-GHI-JKL' }) {
  const { personaName, mood, isLocked } = usePersonaStore();
  const [personaSheetOpen, setPersonaSheetOpen] = useState(false);
  const [seedModalOpen, setSeedModalOpen] = useState(false);

  return (
    <>
      <header className="bg-codex border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-cinzel text-2xl text-amber">⚔ SENTINEL</h1>
          <div className="text-sm text-dust">{worldName}</div>
        </div>

        <div className="flex items-center gap-6">
          {/* Seed string */}
          <button
            onClick={() => setSeedModalOpen(true)}
            className="text-xs font-mono text-amber hover:text-amber/80 transition-colors flex items-center gap-1"
          >
            {seedString} <Share2 size={14} />
          </button>

          {/* Persona + mood */}
          <button
            onClick={() => setPersonaSheetOpen(true)}
            className="text-sm hover:text-amber transition-colors"
          >
            <span className="text-amber font-medium">{personaName}</span>
            <span className="text-dust mx-1">•</span>
            <span className="text-dust">{mood}</span>
            <span className="ml-2">
              {isLocked ? '🔒' : '▾'}
            </span>
          </button>

          <button className="text-ink hover:text-amber transition-colors">
            <Menu size={20} />
          </button>
        </div>
      </header>

      <PersonaSheet open={personaSheetOpen} onClose={() => setPersonaSheetOpen(false)} moods={['neutral', 'ominous', 'lore-heavy']} />
      <SeedShareModal open={seedModalOpen} onClose={() => setSeedModalOpen(false)} seed={seedString} worldName={worldName} />
    </>
  );
}
