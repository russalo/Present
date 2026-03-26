export function FactionList({ factions }) {
  return (
    <div>
      <h3 className="text-amber font-cinzel text-sm mb-2">▸ FACTIONS</h3>
      {factions.length === 0 ? (
        <p className="text-dust text-xs">Powers yet unseen...</p>
      ) : (
        <ul className="text-xs text-ink space-y-1">
          {factions.map(fac => (
            <li key={fac.id} className="hover:text-amber cursor-pointer transition-colors animate-fade-in">
              ▸ {fac.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
