export function InventoryPanel() {
  return (
    <div className="p-4 text-sm text-dust">
      <div className="space-y-2">
        <div className="text-amber font-cinzel text-xs mb-3">INVENTORY</div>
        <div className="text-xs">
          <p className="mb-2">You carry nothing yet.</p>
          <p className="text-ether">Items will appear here as you acquire them.</p>
        </div>
      </div>
    </div>
  );
}
