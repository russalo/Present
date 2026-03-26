export function GenreSelector({ value, onChange, genres }) {
  return (
    <div>
      <label className="block text-amber font-cinzel text-sm mb-3">GENRE</label>
      <div className="grid grid-cols-2 gap-2">
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => onChange(genre)}
            className={`py-2 px-3 rounded text-sm transition-colors ${
              value === genre
                ? 'bg-amber text-void'
                : 'bg-border text-ink hover:bg-border/80'
            }`}
          >
            {genre.charAt(0).toUpperCase() + genre.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
