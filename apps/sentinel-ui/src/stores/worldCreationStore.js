import { create } from 'zustand';

export const useWorldCreationStore = create((set) => ({
  // Form state
  worldName: '',
  characterName: '',
  characterClass: '',
  genre: null,
  tone: null,
  startingRegion: null,
  personaId: null,
  mood: 'neutral',
  sandbox: false,
  permadeath: false,

  // Seed preview
  seedPreview: null,
  abbreviatedSeed: '',

  // Updates
  setWorldName: (name) => set({ worldName: name }),
  setCharacterName: (name) => set({ characterName: name }),
  setCharacterClass: (cls) => set({ characterClass: cls }),
  setGenre: (genre) => set({ genre }),
  setTone: (tone) => set({ tone }),
  setStartingRegion: (region) => set({ startingRegion: region }),
  setPersona: (id, initialMood) => set({ personaId: id, mood: initialMood || 'neutral' }),
  setMood: (mood) => set({ mood }),
  setModifiers: (sandbox, permadeath) => set({ sandbox, permadeath }),
  setSeedPreview: (preview, abbreviated) => set({ seedPreview: preview, abbreviatedSeed: abbreviated }),

  reset: () => set({
    worldName: '',
    characterName: '',
    characterClass: '',
    genre: null,
    tone: null,
    startingRegion: null,
    personaId: null,
    mood: 'neutral',
    sandbox: false,
    permadeath: false,
    seedPreview: null,
    abbreviatedSeed: '',
  }),
}));
