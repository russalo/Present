export function LiveSeedPreview({ preview, seed, isGenerating }) {
  return (
    <div className="card sticky top-6">
      <h3 className="font-cinzel text-amber text-sm mb-4">SEED PREVIEW</h3>

      {!preview ? (
        <div className="text-center text-dust py-8">
          <p className="text-xs">Complete the form to generate a seed</p>
        </div>
      ) : (
        <div className="space-y-3 text-xs">
          {/* World identity */}
          <div>
            <div className="text-ether">World</div>
            <div className="text-ink font-crimson">{preview.worldName}</div>
          </div>

          {/* Genre & Tone */}
          <div>
            <div className="text-ether">Genre</div>
            <div className="text-ink capitalize">{preview.genre}</div>
          </div>

          <div>
            <div className="text-ether">Tone</div>
            <div className="text-ink capitalize">{preview.tone}</div>
          </div>

          {/* Region */}
          <div>
            <div className="text-ether">Starting Region</div>
            <div className="text-ink">{preview.startingRegion}</div>
          </div>

          {/* DM Persona & Mood */}
          <div>
            <div className="text-ether">DM Persona</div>
            <div className="text-ink">{preview.personaName} • {preview.mood}</div>
          </div>

          {/* Seed String */}
          {seed && (
            <div className="border-t border-border pt-3 mt-3">
              <div className="text-ether mb-1">Seed String</div>
              <div className="font-mono bg-void p-2 rounded text-amber text-xs break-all">
                {seed}
                {isGenerating && <span className="animate-pulse">...</span>}
              </div>
            </div>
          )}

          {/* Hidden fields note */}
          <div className="border-t border-border pt-3 mt-3">
            <div className="text-dust text-xs italic">
              Hidden fields are sealed at creation and known only to the DM.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
