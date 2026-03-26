export function PersonaSelector({ value, onChange, personas }) {
  return (
    <div>
      <label className="block text-amber font-cinzel text-sm mb-3">DM PERSONA</label>
      <div className="space-y-2">
        {personas.map(persona => (
          <label key={persona.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-border/20 rounded">
            <input
              type="radio"
              name="persona"
              value={persona.id}
              checked={value === persona.id}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4"
            />
            <div>
              <div className="text-ink font-medium">{persona.name}</div>
              <div className="text-xs text-dust">Compatible with {persona.compatibleGenres.join(', ')}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
