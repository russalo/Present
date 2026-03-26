import { useWorldStore } from '../../stores/worldStore';

export function WorldStateDashboard() {
  const { worldName, locations, characters, factions, day, tension } = useWorldStore();

  const tensionColor = {
    calm: 'text-leyline',
    moderate: 'text-amber',
    high: 'text-blood',
    critical: 'text-blood',
  }[tension] || 'text-dust';

  return (
    <div className="p-4 space-y-4">
      {/* Locations */}
      <div>
        <h3 className="text-amber font-cinzel text-sm mb-2">◈ LOCATIONS</h3>
        <ul className="text-xs text-ink space-y-1">
          {locations.length === 0 ? (
            <li className="text-dust">Unknown...</li>
          ) : (
            locations.map(loc => (
              <li key={loc.id} className="hover:text-amber cursor-pointer">▸ {loc.name}</li>
            ))
          )}
        </ul>
      </div>

      {/* Characters */}
      <div>
        <h3 className="text-amber font-cinzel text-sm mb-2">◉ CHARACTERS</h3>
        <ul className="text-xs text-ink space-y-1">
          {characters.length === 0 ? (
            <li className="text-dust">None met.</li>
          ) : (
            characters.map(char => (
              <li key={char.id} className="hover:text-amber cursor-pointer">◎ {char.name}</li>
            ))
          )}
        </ul>
      </div>

      {/* Factions */}
      <div>
        <h3 className="text-amber font-cinzel text-sm mb-2">▸ FACTIONS</h3>
        <ul className="text-xs text-ink space-y-1">
          {factions.length === 0 ? (
            <li className="text-dust">Unknown.</li>
          ) : (
            factions.map(fac => (
              <li key={fac.id} className="hover:text-amber cursor-pointer">▸ {fac.name}</li>
            ))
          )}
        </ul>
      </div>

      {/* World Metrics */}
      <div className="border-t border-border pt-4 mt-4">
        <div className="text-xs text-dust space-y-1">
          <div><span className="text-amber">Day</span> {day} of 365</div>
          <div><span className="text-amber">Tension</span> <span className={tensionColor}>{tension}</span></div>
        </div>
      </div>
    </div>
  );
}
