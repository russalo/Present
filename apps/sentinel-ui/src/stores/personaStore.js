import { create } from 'zustand';

export const usePersonaStore = create((set) => ({
  // Persona type
  personaId: null,
  personaName: 'Oracle',
  setPersona: (id, name) => set({ personaId: id, personaName: name }),

  // Mood (always changeable)
  mood: 'neutral',
  setMood: (mood) => set({ mood }),

  // Lock state (persona type cannot change when locked, unless unlocked by event)
  isLocked: true,
  isSandbox: false,
  unlock: () => set({ isLocked: false }),
  lock: () => set({ isLocked: true }),
  setSandbox: (sandbox) => set({ isSandbox: sandbox }),
}));
