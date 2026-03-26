export function WorldModifiers({ sandbox, permadeath, onChange }) {
  return (
    <div>
      <label className="block text-amber font-cinzel text-sm mb-3">MODIFIERS</label>
      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-border/20 rounded">
          <input
            type="checkbox"
            checked={sandbox}
            onChange={(e) => onChange(e.target.checked, permadeath)}
            className="w-4 h-4"
          />
          <div>
            <div className="text-ink font-medium">Sandbox Mode</div>
            <div className="text-xs text-dust">Persona can be changed freely during play</div>
          </div>
        </label>
        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-border/20 rounded">
          <input
            type="checkbox"
            checked={permadeath}
            onChange={(e) => onChange(sandbox, e.target.checked)}
            className="w-4 h-4"
          />
          <div>
            <div className="text-ink font-medium">Permadeath</div>
            <div className="text-xs text-dust">One life, one chance</div>
          </div>
        </label>
      </div>
    </div>
  );
}
