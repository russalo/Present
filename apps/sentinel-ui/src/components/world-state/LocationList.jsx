export function LocationList({ locations }) {
  return (
    <div>
      <h3 className="text-amber font-cinzel text-sm mb-2">◈ LOCATIONS</h3>
      {locations.length === 0 ? (
        <p className="text-dust text-xs">Unknown territories ahead...</p>
      ) : (
        <ul className="text-xs text-ink space-y-1">
          {locations.map(loc => (
            <li key={loc.id} className="hover:text-amber cursor-pointer transition-colors animate-fade-in">
              ▸ {loc.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
