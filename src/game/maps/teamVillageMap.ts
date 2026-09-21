export type MapPoint = {
  readonly x: number
  readonly y: number
}

export type MapRectangle = MapPoint & {
  readonly width: number
  readonly height: number
}

export type TreeDefinition = MapPoint & {
  readonly crownRadius: number
  readonly crownColor: number
}

export type HouseDefinition = MapRectangle & {
  readonly wallColor: number
  readonly roofColor: number
  readonly doorSide: 'north' | 'south'
}

export type VillageCenterDefinition = MapPoint & {
  readonly radius: number
  readonly featureRadius: number
}

export type SpawnPointDefinition = MapPoint & {
  readonly radius: number
}

export type TeamVillageMapDefinition = {
  readonly world: {
    readonly width: number
    readonly height: number
  }
  readonly playableBounds: MapRectangle
  readonly spawnPoint: SpawnPointDefinition
  readonly villageCenter: VillageCenterDefinition
  readonly paths: readonly MapRectangle[]
  readonly houses: readonly HouseDefinition[]
  readonly trees: readonly TreeDefinition[]
}

export const teamVillageMap: TeamVillageMapDefinition = {
  world: {
    width: 1920,
    height: 1280,
  },
  playableBounds: {
    x: 64,
    y: 64,
    width: 1792,
    height: 1152,
  },
  spawnPoint: {
    x: 960,
    y: 1080,
    radius: 34,
  },
  villageCenter: {
    x: 960,
    y: 640,
    radius: 132,
    featureRadius: 34,
  },
  paths: [
    { x: 900, y: 64, width: 120, height: 1152 },
    { x: 64, y: 580, width: 1792, height: 120 },
    { x: 180, y: 315, width: 720, height: 74 },
    { x: 1020, y: 315, width: 720, height: 74 },
    { x: 180, y: 895, width: 720, height: 74 },
    { x: 1020, y: 895, width: 720, height: 74 },
  ],
  houses: [
    {
      x: 230,
      y: 135,
      width: 220,
      height: 145,
      wallColor: 0xf0d6a5,
      roofColor: 0xa84637,
      doorSide: 'south',
    },
    {
      x: 570,
      y: 135,
      width: 220,
      height: 145,
      wallColor: 0xd9e6c3,
      roofColor: 0x4f785f,
      doorSide: 'south',
    },
    {
      x: 1130,
      y: 135,
      width: 220,
      height: 145,
      wallColor: 0xe9c7af,
      roofColor: 0x865347,
      doorSide: 'south',
    },
    {
      x: 1470,
      y: 135,
      width: 220,
      height: 145,
      wallColor: 0xcfdedc,
      roofColor: 0x3f6970,
      doorSide: 'south',
    },
    {
      x: 230,
      y: 995,
      width: 220,
      height: 145,
      wallColor: 0xcfdedc,
      roofColor: 0x3f6970,
      doorSide: 'north',
    },
    {
      x: 570,
      y: 995,
      width: 220,
      height: 145,
      wallColor: 0xe9c7af,
      roofColor: 0x865347,
      doorSide: 'north',
    },
    {
      x: 1130,
      y: 995,
      width: 220,
      height: 145,
      wallColor: 0xd9e6c3,
      roofColor: 0x4f785f,
      doorSide: 'north',
    },
    {
      x: 1470,
      y: 995,
      width: 220,
      height: 145,
      wallColor: 0xf0d6a5,
      roofColor: 0xa84637,
      doorSide: 'north',
    },
  ],
  trees: [
    { x: 130, y: 150, crownRadius: 32, crownColor: 0x477b55 },
    { x: 130, y: 330, crownRadius: 28, crownColor: 0x5c8b57 },
    { x: 130, y: 505, crownRadius: 34, crownColor: 0x477b55 },
    { x: 130, y: 785, crownRadius: 30, crownColor: 0x5c8b57 },
    { x: 130, y: 960, crownRadius: 33, crownColor: 0x477b55 },
    { x: 130, y: 1135, crownRadius: 29, crownColor: 0x5c8b57 },
    { x: 1790, y: 150, crownRadius: 29, crownColor: 0x5c8b57 },
    { x: 1790, y: 330, crownRadius: 34, crownColor: 0x477b55 },
    { x: 1790, y: 505, crownRadius: 30, crownColor: 0x5c8b57 },
    { x: 1790, y: 785, crownRadius: 33, crownColor: 0x477b55 },
    { x: 1790, y: 960, crownRadius: 28, crownColor: 0x5c8b57 },
    { x: 1790, y: 1135, crownRadius: 32, crownColor: 0x477b55 },
    { x: 305, y: 475, crownRadius: 35, crownColor: 0x477b55 },
    { x: 470, y: 500, crownRadius: 27, crownColor: 0x5c8b57 },
    { x: 655, y: 475, crownRadius: 32, crownColor: 0x477b55 },
    { x: 790, y: 505, crownRadius: 28, crownColor: 0x5c8b57 },
    { x: 1130, y: 500, crownRadius: 28, crownColor: 0x5c8b57 },
    { x: 1280, y: 475, crownRadius: 33, crownColor: 0x477b55 },
    { x: 1450, y: 500, crownRadius: 27, crownColor: 0x5c8b57 },
    { x: 1620, y: 475, crownRadius: 35, crownColor: 0x477b55 },
    { x: 305, y: 790, crownRadius: 30, crownColor: 0x5c8b57 },
    { x: 470, y: 765, crownRadius: 35, crownColor: 0x477b55 },
    { x: 655, y: 790, crownRadius: 28, crownColor: 0x5c8b57 },
    { x: 790, y: 765, crownRadius: 32, crownColor: 0x477b55 },
    { x: 1130, y: 765, crownRadius: 32, crownColor: 0x477b55 },
    { x: 1280, y: 790, crownRadius: 28, crownColor: 0x5c8b57 },
    { x: 1450, y: 765, crownRadius: 35, crownColor: 0x477b55 },
    { x: 1620, y: 790, crownRadius: 30, crownColor: 0x5c8b57 },
  ],
}