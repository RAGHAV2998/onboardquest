import type { LevelDefinition } from '../types/progression'

export const levelDefinitions = [
  { level: 1, minimumXp: 0 },
  { level: 2, minimumXp: 100 },
  { level: 3, minimumXp: 250 },
  { level: 4, minimumXp: 500 },
] as const satisfies readonly LevelDefinition[]