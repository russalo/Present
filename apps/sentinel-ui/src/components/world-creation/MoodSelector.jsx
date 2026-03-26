export function MoodSelector({ value, onChange, moods }) {
  return (
    <div>
      <label className="block text-amber font-cinzel text-sm mb-3">MOOD</label>
      <div className="flex flex-wrap gap-2">
        {moods.map(mood => (
          <button
            key={mood}
            onClick={() => onChange(mood)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              value === mood
                ? 'bg-leyline text-void'
                : 'bg-border text-ink hover:bg-border/80'
            }`}
          >
            {mood.charAt(0).toUpperCase() + mood.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
