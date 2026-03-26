export function RegionSelector({ value, onChange, regions }) {
  return (
    <div>
      <label className="block text-amber font-cinzel text-sm mb-3">STARTING REGION</label>
      <div className="space-y-2">
        {regions.map(region => (
          <label key={region} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-border/20 rounded">
            <input
              type="radio"
              name="region"
              value={region}
              checked={value === region}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4"
            />
            <span className="text-ink">{region}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
