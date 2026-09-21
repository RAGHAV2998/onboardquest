import type { DiscoveryObjectDefinition } from '../types/territory'

export const documentationObjects = [
  {
    objectId: 'architecture-guide',
    territoryId: 'documentation',
    title: 'Architecture Guide',
    position: { x: 320, y: 280 },
    color: 0x477b75,
    interactionRadius: 105,
  },
  {
    objectId: 'setup-guide',
    territoryId: 'documentation',
    title: 'Setup Guide',
    position: { x: 1120, y: 280 },
    color: 0xa35c47,
    interactionRadius: 105,
  },
  {
    objectId: 'team-wiki',
    territoryId: 'documentation',
    title: 'Team Wiki',
    position: { x: 720, y: 720 },
    color: 0x77629a,
    interactionRadius: 105,
  },
] as const satisfies readonly DiscoveryObjectDefinition[]