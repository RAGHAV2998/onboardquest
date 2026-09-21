export const npcIds = [
  'manager',
  'buddy',
  'senior-engineer',
  'product-manager',
  'mentor',
] as const

export type NpcId = (typeof npcIds)[number]

export type NpcDefinition = {
  readonly id: NpcId
  readonly name: string
  readonly mapId: 'team-village' | 'mentor-tower'
  readonly position: {
    readonly x: number
    readonly y: number
  }
  readonly color: number
  readonly interactionRadius: number
  readonly appearance?: 'standard' | 'mentor'
}

export type MentorProfile = {
  readonly npcId: 'mentor'
  readonly name: string
  readonly role: string
  readonly summary: string
  readonly howTheyCanHelp: string
}

export type NpcInteractionEvent = {
  readonly npcId: NpcId
  readonly npcName: string
  readonly discovered: true
  readonly firstDiscovery: boolean
}

export function isNpcId(value: unknown): value is NpcId {
  return (
    typeof value === 'string' &&
    (npcIds as readonly string[]).includes(value)
  )
}