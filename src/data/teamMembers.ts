import type { NpcDefinition } from '../types/npc'

export const teamMembers = [
  {
    id: 'buddy',
    name: 'Buddy',
    mapId: 'team-village',
    position: {
      x: 1080,
      y: 920,
    },
    color: 0x2f6f7e,
    interactionRadius: 120,
  },
  {
    id: 'manager',
    name: 'Manager',
    mapId: 'team-village',
    position: {
      x: 840,
      y: 350,
    },
    color: 0x8a5a9b,
    interactionRadius: 120,
  },
  {
    id: 'senior-engineer',
    name: 'Senior Engineer',
    mapId: 'team-village',
    position: {
      x: 520,
      y: 640,
    },
    color: 0xb56b36,
    interactionRadius: 120,
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    mapId: 'team-village',
    position: {
      x: 1400,
      y: 640,
    },
    color: 0x3c7d61,
    interactionRadius: 120,
  },
] as const satisfies readonly NpcDefinition[]