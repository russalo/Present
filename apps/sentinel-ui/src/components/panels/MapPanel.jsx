export function MapPanel() {
  const map = [
    '∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙',
    '∙ ∙ ▲ ▲ ∙ ∙ ∙ ∙ ∙ ∙',
    '∙ ∙ ▲ ∙ ∙ ◈ ∙ ∙ ∙ ∙',
    '∙ ∙ ∙ ∙ ≈ ≈ ∙ ∙ ∙ ∙',
    '∙ ✦ ∙ ∙ ≈ ∙ ∙ ∙ ∙ ∙',
    '∙ ∙ ∙ ∙ ∙ ∙ ? ∙ ∙ ∙',
    '∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙',
  ];

  return (
    <div className="p-4 text-sm">
      <div className="mb-3 text-amber font-cinzel text-xs">MAP</div>
      <div className="bg-void p-2 rounded border border-border">
        <pre className="font-mono text-xs text-dust leading-relaxed">
          {map.join('\n')}
        </pre>
      </div>
      <div className="mt-3 text-xs text-dust space-y-1">
        <div>▲ Mountains</div>
        <div>◈ Your position</div>
        <div>✦ Discovered location</div>
        <div>? Heard of but not visited</div>
        <div>≈ Water</div>
        <div>∙ Unexplored</div>
      </div>
    </div>
  );
}
