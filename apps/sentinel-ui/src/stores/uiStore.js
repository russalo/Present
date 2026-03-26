import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Panel collapse state
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,
  toggleLeftPanel: () => set((state) => ({ leftPanelCollapsed: !state.leftPanelCollapsed })),
  toggleRightPanel: () => set((state) => ({ rightPanelCollapsed: !state.rightPanelCollapsed })),

  // Right panel active tab
  activeTab: 'codex', // 'codex', 'inventory', 'quests', 'map'
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Focus mode (full narrative, no side panels)
  focusMode: false,
  toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
}));
