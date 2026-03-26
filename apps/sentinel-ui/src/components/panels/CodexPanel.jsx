export function CodexPanel() {
  return (
    <div className="p-4 text-sm text-dust">
      <div className="space-y-2">
        <div className="text-amber font-cinzel text-xs mb-3">DISCOVERED ENTITIES</div>
        <div className="text-xs">
          <p className="mb-2">No discoveries yet.</p>
          <p className="text-ether">As you explore, locations, NPCs, and factions will appear here.</p>
        </div>
      </div>
    </div>
  );
}
