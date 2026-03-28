import { create } from 'zustand';

export const usePlayerStore = create((set) => ({
  // Session
  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),

  // Character identity
  characterName: '',
  characterClass: '',
  setCharacter: (name, charClass) => set({ characterName: name, characterClass: charClass }),

  // Inventory
  inventory: [],
  addItem: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
  removeItem: (itemId) => set((state) => ({
    inventory: state.inventory.filter(i => i.id !== itemId),
  })),
  updateItem: (itemId, updates) => set((state) => ({
    inventory: state.inventory.map(i => i.id === itemId ? { ...i, ...updates } : i),
  })),

  // Quests
  quests: [],
  addQuest: (quest) => set((state) => ({ quests: [...state.quests, quest] })),
  updateQuest: (questId, updates) => set((state) => ({
    quests: state.quests.map(q => q.id === questId ? { ...q, ...updates } : q),
  })),
  completeQuest: (questId) => set((state) => ({
    quests: state.quests.map(q => q.id === questId ? { ...q, completed: true } : q),
  })),
}));
