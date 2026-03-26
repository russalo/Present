import { create } from 'zustand';

export const useWorldStore = create((set) => ({
  // World metadata
  worldName: '',
  genre: '',
  tone: '',
  setWorldMetadata: (metadata) => set(metadata),

  // Locations
  locations: [],
  addLocation: (location) => set((state) => ({ locations: [...state.locations, location] })),
  updateLocation: (id, updates) => set((state) => ({
    locations: state.locations.map(l => l.id === id ? { ...l, ...updates } : l),
  })),

  // Characters/NPCs
  characters: [],
  addCharacter: (character) => set((state) => ({ characters: [...state.characters, character] })),
  updateCharacter: (id, updates) => set((state) => ({
    characters: state.characters.map(c => c.id === id ? { ...c, ...updates } : c),
  })),

  // Factions
  factions: [],
  addFaction: (faction) => set((state) => ({ factions: [...state.factions, faction] })),
  updateFaction: (id, updates) => set((state) => ({
    factions: state.factions.map(f => f.id === id ? { ...f, ...updates } : f),
  })),

  // World metrics
  day: 1,
  tension: 'calm', // calm, moderate, high, critical
  setDay: (day) => set({ day }),
  setTension: (tension) => set({ tension }),

  // Bulk hydration from API
  hydrate: (worldState) => set({
    worldName: worldState.name || '',
    genre: worldState.genre || '',
    tone: worldState.tone || '',
    locations: worldState.locations || [],
    characters: worldState.characters || [],
    factions: worldState.factions || [],
    day: worldState.day || 1,
    tension: worldState.tension || 'calm',
  }),
}));
