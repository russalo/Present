export function ToneSelector({ value, onChange, tones }) {
  return (
    <div>
      <label className="block text-amber font-cinzel text-sm mb-2">TONE</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-void border border-border rounded px-3 py-2 text-ink focus:outline-none focus:border-amber transition-colors"
      >
        <option value="">Select a tone...</option>
        {tones.map(tone => (
          <option key={tone} value={tone}>
            {tone.charAt(0).toUpperCase() + tone.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
