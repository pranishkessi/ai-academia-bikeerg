// src/constants/unlocks.js
export const UNLOCKS = [
  { label: "Simple Google search query", threshold: 0.002 },
  { label: "Sound recognition", threshold: 0.004 },
  { label: "Speech-to-text transcription", threshold: 0.006 },
  { label: "LLM (ChatGPT response)", threshold: 0.008 },
];

// Helper to count unlocked at a given energy:
export const countUnlocked = (energy) =>
  UNLOCKS.filter(u => energy >= u.threshold).length;
