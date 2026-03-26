import { X, Copy } from 'lucide-react';

export function SeedShareModal({ open, onClose, seed, worldName }) {
  if (!open) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-codex border border-border rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-codex border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="font-cinzel text-amber text-lg">SHARE WORLD</h2>
          <button
            onClick={onClose}
            className="text-dust hover:text-amber transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Seed string */}
          {seed && (
            <div>
              <div className="text-amber font-cinzel text-sm mb-2">SEED STRING</div>
              <div className="flex gap-2">
                <code className="flex-1 bg-void border border-border rounded px-3 py-2 text-amber font-mono text-xs break-all">
                  {seed}
                </code>
                <button
                  onClick={() => copyToClipboard(seed)}
                  className="px-3 py-2 bg-border text-ink rounded hover:bg-border/80 transition-colors"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Visible fields */}
          <div className="border-t border-border pt-4">
            <div className="text-amber font-cinzel text-sm mb-3">VISIBLE SEED FIELDS</div>
            <div className="space-y-2 text-xs">
              <div><span className="text-dust">World:</span> <span className="text-ink">{worldName}</span></div>
              <div><span className="text-dust">These fields are shared and visible to anyone with the seed.</span></div>
            </div>
          </div>

          {/* Hidden fields notice */}
          <div className="bg-void border border-ether/20 rounded p-3">
            <div className="text-ether font-cinzel text-xs mb-2">🔐 HIDDEN FIELDS</div>
            <div className="text-dust text-xs">
              The following fields are sealed at creation and known only to the DM:
            </div>
            <ul className="text-dust text-xs mt-2 space-y-1 ml-3">
              <li>• RNG and entropy values</li>
              <li>• Off-screen NPCs and agendas</li>
              <li>• NPC secrets and motivations</li>
              <li>• Hidden lore hooks</li>
            </ul>
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
