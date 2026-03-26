import { useUIStore } from '../../stores/uiStore';

export function PanelRouter() {
  const { activeTab, setActiveTab } = useUIStore();

  const tabs = [
    { id: 'codex', label: 'Codex' },
    { id: 'inventory', label: 'Inv' },
    { id: 'quests', label: 'Quests' },
    { id: 'map', label: 'Map' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tab buttons */}
      <div className="flex gap-1 p-2 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              activeTab === tab.id
                ? 'bg-amber text-void'
                : 'bg-border text-ink hover:bg-border/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 text-sm text-dust">
        {activeTab === 'codex' && <div>Codex content coming soon...</div>}
        {activeTab === 'inventory' && <div>Inventory empty.</div>}
        {activeTab === 'quests' && <div>No active quests.</div>}
        {activeTab === 'map' && <div>Map not yet explored.</div>}
      </div>
    </div>
  );
}
