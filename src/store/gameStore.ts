import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Core types ───────────────────────────────────────────────────────────────

export interface DieFace {
  type: 'damage' | 'shield' | 'heal' | 'skull' | 'souls' | 'lifesteal' | 'choose_next' | 'wildcard' | 'blank' | 'purified_skull' | 'multiplier' | 'poison'
  value: number
}

export type DieType = 'white' | 'blue' | 'green' | 'cursed'
                    | 'heavy' | 'paladin' | 'gambler' | 'scavenger' | 'wall'
                    | 'jackpot' | 'vampire' | 'priest' | 'fortune_teller'
                    | 'joker' | 'unique' | 'blight'

export interface Die {
  id: string
  dieType: DieType
  name: string
  sides: number
  faces: DieFace[]
  currentFace?: DieFace
  isMerged?: boolean
  mergeLevel?: number
  isCustomized?: boolean
  isEquipped?: boolean
}

export const UNIQUE_DIE_TYPES = new Set<DieType>(['unique'])

export const DIE_NAMES: Record<DieType, string> = {
  white:          'The Basic',
  blue:           'The Guard',
  green:          'The Mender',
  cursed:         'The Cursed',
  heavy:          'The Heavy',
  paladin:        'The Paladin',
  gambler:        'The Gambler',
  scavenger:      'The Scavenger',
  wall:           'The Wall',
  jackpot:        'The Jackpot',
  vampire:        'The Vampire',
  priest:         'The Priest',
  fortune_teller: 'The Fortune Teller',
  joker:          'The Joker',
  unique:         'The Multiplier',
  blight:         'The Blight',
}

export interface SkillNode {
  id: string
  name: string
  description: string
  cost: number
  x: number
  y: number
  requires: string[]
}

export type ActModifier = 'none' | 'thorns' | 'damage_cap'

export interface Act {
  id: number
  name: string
  description: string
  modifier: ActModifier
  startFloor: number
  endFloor: number
}

export type TurnPhase = 'loadout' | 'idle' | 'drawing' | 'player_attack' | 'enemy_attack' | 'draft' | 'shop' | 'inter_act_cull'
export type ResolvingPhase = 'spinning' | 'landed' | null

// ── Die factory ──────────────────────────────────────────────────────────────

export const DIE_TEMPLATES: Record<DieType, { sides: number; faces: DieFace[] }> = {
  white: {
    sides: 6,
    faces: [
      { type: 'damage', value: 1 },
      { type: 'damage', value: 2 },
      { type: 'damage', value: 3 },
      { type: 'damage', value: 4 },
      { type: 'damage', value: 5 },
      { type: 'damage', value: 6 },
    ],
  },
  blue: {
    sides: 6,
    faces: [
      { type: 'shield', value: 1 },
      { type: 'shield', value: 2 },
      { type: 'shield', value: 3 },
      { type: 'shield', value: 4 },
      { type: 'damage', value: 1 },
      { type: 'damage', value: 2 },
    ],
  },
  green: {
    sides: 6,
    faces: [
      { type: 'heal', value: 1 },
      { type: 'heal', value: 2 },
      { type: 'heal', value: 3 },
      { type: 'damage', value: 1 },
      { type: 'damage', value: 2 },
      { type: 'damage', value: 3 },
    ],
  },
  cursed: {
    sides: 6,
    faces: [
      { type: 'skull', value: 1 },
      { type: 'skull', value: 1 },
      { type: 'skull', value: 1 },
      { type: 'skull', value: 1 },
      { type: 'skull', value: 1 },
      { type: 'skull', value: 1 },
    ],
  },
  heavy: {
    sides: 6,
    faces: [
      { type: 'damage', value: 4 },
      { type: 'damage', value: 6 },
      { type: 'damage', value: 7 },
      { type: 'damage', value: 9 },
      { type: 'skull',  value: 1 },
      { type: 'skull',  value: 1 },
    ],
  },
  paladin: {
    sides: 6,
    faces: [
      { type: 'shield', value: 1 },
      { type: 'shield', value: 1 },
      { type: 'shield', value: 2 },
      { type: 'heal',   value: 1 },
      { type: 'heal',   value: 2 },
      { type: 'heal',   value: 2 },
    ],
  },
  gambler: {
    sides: 6,
    faces: [
      { type: 'damage', value: 12 },
      { type: 'damage', value: 12 },
      { type: 'blank',  value: 0  },
      { type: 'blank',  value: 0  },
      { type: 'skull',  value: 1  },
      { type: 'skull',  value: 1  },
    ],
  },
  scavenger: {
    sides: 6,
    faces: [
      { type: 'souls',   value: 3 },
      { type: 'souls',   value: 4 },
      { type: 'shield', value: 1 },
      { type: 'shield', value: 2 },
      { type: 'shield', value: 3 },
      { type: 'skull',  value: 1 },
    ],
  },
  wall: {
    sides: 6,
    faces: [
      { type: 'shield', value: 2 },
      { type: 'shield', value: 3 },
      { type: 'shield', value: 4 },
      { type: 'shield', value: 4 },
      { type: 'shield', value: 5 },
      { type: 'shield', value: 6 },
    ],
  },

  jackpot: {
    sides: 6,
    faces: [
      { type: 'damage', value: 30 },
      { type: 'skull',  value: 1  },
      { type: 'skull',  value: 1  },
      { type: 'skull',  value: 1  },
      { type: 'blank',  value: 0  },
      { type: 'blank',  value: 0  },
    ],
  },
  vampire: {
    sides: 6,
    faces: [
      { type: 'lifesteal', value: 1 },
      { type: 'lifesteal', value: 2 },
      { type: 'lifesteal', value: 2 },
      { type: 'lifesteal', value: 3 },
      { type: 'lifesteal', value: 4 },
      { type: 'skull',     value: 1 },
    ],
  },
  priest: {
    sides: 6,
    faces: [
      { type: 'heal', value: 1 },
      { type: 'heal', value: 2 },
      { type: 'heal', value: 2 },
      { type: 'heal', value: 3 },
      { type: 'heal', value: 3 },
      { type: 'heal', value: 4 },
    ],
  },
  fortune_teller: {
    sides: 6,
    faces: [
      { type: 'choose_next', value: 0 },
      { type: 'choose_next', value: 0 },
      { type: 'choose_next', value: 0 },
      { type: 'choose_next', value: 0 },
      { type: 'skull',       value: 1 },
      { type: 'skull',       value: 1 },
    ],
  },
  joker: {
    sides: 6,
    faces: [
      { type: 'wildcard', value: 0 },
      { type: 'wildcard', value: 0 },
      { type: 'wildcard', value: 0 },
      { type: 'wildcard', value: 0 },
      { type: 'wildcard', value: 0 },
      { type: 'wildcard', value: 0 },
    ],
  },
  unique: {
    sides: 6,
    faces: [
      { type: 'multiplier', value: 3 },
      { type: 'multiplier', value: 3 },
      { type: 'multiplier', value: 3 },
      { type: 'multiplier', value: 3 },
      { type: 'multiplier', value: 3 },
      { type: 'multiplier', value: 3 },
    ],
  },
  blight: {
    sides: 6,
    faces: [
      { type: 'poison', value: 1 },
      { type: 'poison', value: 2 },
      { type: 'poison', value: 2 },
      { type: 'shield', value: 2 },
      { type: 'skull',  value: 1 },
      { type: 'skull',  value: 1 },
    ],
  },
}

function createDie(type: DieType, id: string): Die {
  const t = DIE_TEMPLATES[type]
  return { id, dieType: type, name: DIE_NAMES[type], sides: t.sides, faces: t.faces }
}

function rollFace(die: Die): DieFace {
  return die.faces[Math.floor(Math.random() * die.faces.length)]
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Store ────────────────────────────────────────────────────────────────────

export interface EnemyIntent { type: 'attack' | 'shield' | 'thorns_activate'; value: number }
export interface Enemy {
  hp: number; maxHp: number; name: string; intent: EnemyIntent; isBoss: boolean; poison: number
  thorns?: number; barbs?: number; corrosive?: boolean; shield?: number; intentPhase?: number
}

interface GameState {
  player: { hp: number; maxHp: number; shield: number }
  enemy: Enemy
  inventory: Die[]
  drawPile: Die[]
  playedDice: Die[]
  skullCount: number
  totalDamage: number
  totalHeal: number
  totalShield: number
  totalSouls: number
  totalPoison: number
  lastEffects: { heal: number; shield: number; souls: number }
  turnPhase: TurnPhase
  enemyHitVersion: number
  playerHitVersion: number
  playerEffectVersion: number
  orbVersion: number
  counterVersion: number
  rollStartVersion: number
  resolvingDieIndex: number | null
  resolvingPhase: ResolvingPhase
  enemyAttackVersion: number
  skullRolledVersion: number
  currentFloor: number
  runSouls: number
  draftChoices: Die[]
  lockedDraftDice: Die[]
  lastSoulsEarned: number
  bankedSouls: number
  unlockedNodes: string[]
  showGameOver: boolean
  playerAttackAnimTier: 1 | 2 | 3 | null
  isChoosingNextDie: boolean
  fortuneTellerPicksRemaining: number
  usedSecondWind: boolean
  firstAttackThisEncounter: boolean
  rerollCost: number
  justDefeatedBoss: boolean
  secondWindTriggered: boolean
  showBossRewardModal: boolean
  purifyUsesThisShop: number
  activeMultiplier: number
  multiplierFiredVersion: number
  maxEquippedDice: number
  claimBossReward: () => void
  toggleEquipDie: (dieUid: string) => void
  resetLoadout: () => void
  equipBaseDie: (dieType: DieType) => void
  startCombat: () => void
  drawAndRoll: () => Promise<void>
  drawSpecificDie: (dieId: string) => Promise<void>
  bankAndAttack: () => Promise<void>
  selectDraftDie: (dieId: string, lockedOtherIds: string[]) => void
  skipDraft: () => void
  rerollDraft: (lockedDieIds: string[]) => void
  shopHeal: (cost: number, amount: number) => void
  shopModifyFace: (dieId: string, faceIndex: number, newFace: DieFace, cost: number) => void
  shopMergeDice: (die1Id: string, die2Id: string, cost: number) => void
  shopCraftFace: (dieId: string, faceIndex: number, newFace: DieFace) => void
  shopPurifyFace: (dieId: string, faceIndex: number) => void
  unlockNode: (nodeId: string) => void
  leaveShop: () => void
  extractToBase: () => void
  cullInventory: (selectedIds: string[]) => void
  abandonRun: () => void
  devJumpToForge: () => void
  isAutoBankDevMode: boolean
  toggleAutoBankDevMode: () => void
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const equippedOnly = (dice: Die[]) => dice.filter((d) => d.isEquipped !== false)

// ── Bestiary ─────────────────────────────────────────────────────────────────

interface EnemyTemplate {
  name: string; baseHp: number
  intentMin: number; intentMax: number; isBoss: boolean
  thorns?: number; barbs?: number; corrosive?: boolean
  intentCycle?: Array<{ type: EnemyIntent['type']; value: number }>
}

export const SKILL_TREE_NODES: SkillNode[] = [
  { id: 'sflz4yv3', name: 'The Awakening',        description: 'Your journey begins.',                              cost: 0,    x: -0.75,       y: -1,   requires: [] },
  { id: 'tqo6xv7r', name: 'Pocket Change',         description: 'Start each run with 10 Gold.',                     cost: 100,  x: 202.703125,  y: -94,  requires: ['sflz4yv3'] },
  { id: 'fyuwvmzq', name: 'Vitality I',            description: '+10 Max HP.',                                      cost: 100,  x: 208.078125,  y: 71,   requires: ['sflz4yv3'] },
  { id: 'g1atjka6', name: 'First Blood',           description: 'First attack each encounter gives +1 damage.',     cost: 100,  x: 3.84375,     y: 141,  requires: ['sflz4yv3'] },
  { id: 'kec9ybn2', name: 'New Dice: The Jackpot', description: 'Adds The Jackpot to the dice loot pool.',          cost: 700,  x: -43.828125,  y: -236, requires: ['sflz4yv3'] },
  { id: '60vc1fvg', name: 'New Dice: The Vampire', description: 'Adds The Vampire to the dice loot pool.',          cost: 700,  x: 145.847,     y: -358, requires: ['dx6jq5y5'] },
  { id: '7jutuf9h', name: 'Haggler',               description: 'Rest costs 5 Gold instead of 10.',                 cost: 300,  x: 310.171875,  y: -223, requires: ['tqo6xv7r'] },
  { id: 'r9v5wdgh', name: 'Bounty Hunter',         description: 'Bosses drop 10 extra Gold.',                       cost: 200,  x: 423.171875,  y: -98,  requires: ['tqo6xv7r'] },
  { id: 'aw2b29dw', name: 'Thick Skin',            description: 'Heal 15% of max HP after defeating a boss.',       cost: 150,  x: 394.40625,   y: 14,   requires: ['fyuwvmzq'] },
  { id: 'hnwdjqof', name: 'Sharpened Edges',       description: 'White dice: 1-damage faces become 2-damage.',      cost: 500,  x: 9.046875,    y: 250,  requires: ['g1atjka6'] },
  { id: 'm1hjf9ac', name: 'Forge Master',          description: 'Merge costs 25 Gold instead of 40.',               cost: 1000, x: 613.875,     y: -101, requires: ['r9v5wdgh'] },
  { id: 'co2xusrh', name: 'Vitality II',           description: '+15 Max HP.',                                      cost: 300,  x: 594.46875,   y: 11,   requires: ['aw2b29dw'] },
  { id: '7nescabs', name: 'Second Wind',           description: 'Once per run, revive with 20 HP instead of dying.', cost: 1000, x: 776.84375,  y: 13,   requires: ['co2xusrh'] },
  { id: 'zmumocry', name: 'Scouting',              description: 'You can always see what dice are left in your bag.', cost: 500,  x: -194.9375,  y: 123,  requires: ['sflz4yv3'] },
  { id: 'w6bsuulh', name: 'Auto Roll',             description: 'Auto-draws dice until you reach 2 skulls.',          cost: 500,  x: -375.9375,  y: 211,  requires: ['zmumocry'] },
  { id: 'dx6jq5y5', name: 'New Dice: The Priest',          description: 'Adds The Priest to the dice loot pool.',          cost: 700,  x: 139.167,    y: -246, requires: ['sflz4yv3'] },
  { id: 'qevchxm7', name: 'New Dice: The Fortune Teller',  description: 'Adds The Fortune Teller to the dice loot pool.', cost: 700,  x: -40.724,    y: -347, requires: ['kec9ybn2'] },
]


const ACT_1_BESTIARY: EnemyTemplate[] = [
  { name: 'Slime',    baseHp: 28,  intentMin: 2,  intentMax: 4,  isBoss: false },
  { name: 'Goblin',   baseHp: 42,  intentMin: 4,  intentMax: 6,  isBoss: false },
  { name: 'Skeleton', baseHp: 50,  intentMin: 3,  intentMax: 7,  isBoss: false },
  { name: 'Orc',      baseHp: 60,  intentMin: 6,  intentMax: 9,  isBoss: false },
  { name: 'Demon',    baseHp: 70,  intentMin: 4,  intentMax: 7,  isBoss: true  },
]

const ACT_2_BESTIARY: EnemyTemplate[] = [
  { name: 'Thorned Beetle', baseHp: 55,  intentMin: 5,  intentMax: 8,  isBoss: false, thorns: 0.2 },
  { name: 'Porcupine',      baseHp: 40,  intentMin: 4,  intentMax: 7,  isBoss: false, barbs: 2 },
  { name: 'Toxic Slime',    baseHp: 90,  intentMin: 7,  intentMax: 11, isBoss: false, corrosive: true },
  {
    name: 'Spiked Behemoth', baseHp: 160, intentMin: 18, intentMax: 24, isBoss: true, thorns: 0,
    intentCycle: [
      { type: 'shield',          value: 35 },
      { type: 'attack',          value: 20 },
      { type: 'thorns_activate', value: 0.5 },
    ],
  },
]

function rollIntent(template: EnemyTemplate, floor: number, intentPhase = 0): EnemyIntent {
  if (template.intentCycle && template.intentCycle.length > 0) {
    const def = template.intentCycle[intentPhase % template.intentCycle.length]
    if (def.type === 'attack') return { type: 'attack', value: def.value + Math.floor((floor - 1) * 0.5) }
    return { type: def.type, value: def.value }
  }
  const base = template.intentMin + Math.floor(Math.random() * (template.intentMax - template.intentMin + 1))
  return { type: 'attack', value: base + Math.floor((floor - 1) * 0.5) }
}

function spawnEnemy(floor: number): Enemy {
  const isBossFloor = floor % 5 === 0
  const act         = getCurrentAct(floor)
  const bestiary    = act.id >= 2 ? ACT_2_BESTIARY : ACT_1_BESTIARY
  const bossT       = bestiary.find(t => t.isBoss)!
  const nonBoss     = bestiary.filter(t => !t.isBoss)
  const template    = isBossFloor ? bossT : nonBoss[(floor - 1) % nonBoss.length]
  const hp          = template.baseHp + (floor - 1) * 3
  return {
    hp, maxHp: hp,
    name:        template.name,
    intent:      rollIntent(template, floor, 0),
    isBoss:      template.isBoss,
    poison:      0,
    thorns:      template.thorns,
    barbs:       template.barbs,
    corrosive:   template.corrosive,
    shield:      0,
    intentPhase: 0,
  }
}

const INITIAL_INVENTORY: Die[] = [
  createDie('white',  'w1'), createDie('white',  'w2'), createDie('white',  'w3'),
  createDie('white',  'w4'),
  createDie('blue',   'b1'), createDie('blue',   'b2'),
  createDie('green',  'g1'),
  createDie('cursed', 'c1'), createDie('cursed', 'c2'), createDie('cursed', 'c3'),
]

export const GAME_ACTS: Act[] = [
  { id: 1, name: 'The Brute Tunnels', description: 'Crude warriors armed with raw power.',   modifier: 'none',       startFloor: 1,  endFloor: 15 },
  { id: 2, name: 'The Spiked Depths', description: 'Every hit you take echoes back.',         modifier: 'thorns',     startFloor: 16, endFloor: 30 },
  { id: 3, name: 'The Iron Fortress', description: 'Damage is capped. Outlast or perish.',   modifier: 'damage_cap', startFloor: 31, endFloor: 45 },
]

export function getCurrentAct(floor: number): Act {
  return GAME_ACTS.find((a) => floor >= a.startFloor && floor <= a.endFloor) ?? GAME_ACTS[GAME_ACTS.length - 1]
}

function getDiceLootPool(unlockedNodes: string[]): DieType[] {
  const pool: DieType[] = ['heavy', 'paladin', 'gambler', 'scavenger', 'wall', 'joker', 'unique', 'blight']
  if (unlockedNodes.includes('kec9ybn2')) pool.push('jackpot')
  if (unlockedNodes.includes('60vc1fvg')) pool.push('vampire')
  if (unlockedNodes.includes('dx6jq5y5')) pool.push('priest')
  if (unlockedNodes.includes('qevchxm7')) pool.push('fortune_teller')
  return pool
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
  player: { hp: 100, maxHp: 100, shield: 0 },
  enemy: spawnEnemy(1),
  inventory: INITIAL_INVENTORY.map((d) => ({ ...d })),
  drawPile: [],
  playedDice: [],
  skullCount: 0,
  totalDamage: 0,
  totalHeal: 0,
  totalShield: 0,
  totalSouls: 0,
  totalPoison: 0,
  lastEffects: { heal: 0, shield: 0, souls: 0 },
  turnPhase: 'loadout',
  enemyHitVersion: 0,
  playerHitVersion: 0,
  playerEffectVersion: 0,
  orbVersion: 0,
  counterVersion: 0,
  rollStartVersion: 0,
  resolvingDieIndex: null,
  resolvingPhase: null,
  enemyAttackVersion: 0,
  skullRolledVersion: 0,
  currentFloor: 1,
  runSouls: 0,
  draftChoices: [],
  lockedDraftDice: [],
  lastSoulsEarned: 0,
  bankedSouls: 0,
  unlockedNodes: ['sflz4yv3'],
  playerAttackAnimTier: null,
  isChoosingNextDie: false,
  fortuneTellerPicksRemaining: 0,
  usedSecondWind: false,
  firstAttackThisEncounter: true,
  rerollCost: 5,
  justDefeatedBoss: false,
  secondWindTriggered: false,
  showBossRewardModal: false,
  showGameOver: false,
  purifyUsesThisShop: 0,
  activeMultiplier: 1,
  isAutoBankDevMode: false,
  multiplierFiredVersion: 0,
  maxEquippedDice: 10,

  toggleEquipDie: (dieUid) => {
    set((s) => {
      const die = s.inventory.find((d) => d.id === dieUid)
      if (!die) return {}
      if (die.dieType === 'cursed') return {}
      const isCurrentlyEquipped = die.isEquipped !== false
      if (isCurrentlyEquipped) {
        const isUnmodifiedBase = (['white', 'blue', 'green'] as DieType[]).includes(die.dieType)
          && !die.mergeLevel && !die.isCustomized
        if (isUnmodifiedBase) {
          return { inventory: s.inventory.filter((d) => d.id !== dieUid) }
        }
        return { inventory: s.inventory.map((d) => d.id === dieUid ? { ...d, isEquipped: false } : d) }
      } else {
        if (equippedOnly(s.inventory).length >= s.maxEquippedDice) {
          console.warn(`Loadout full (${s.maxEquippedDice}/${s.maxEquippedDice})`)
          return {}
        }
        return { inventory: s.inventory.map((d) => d.id === dieUid ? { ...d, isEquipped: true } : d) }
      }
    })
  },

  resetLoadout: () => {
    set((s) => ({
      inventory: s.inventory
        .filter((d) => {
          const isUnmodifiedBase = (['white', 'blue', 'green'] as DieType[]).includes(d.dieType)
            && !d.mergeLevel && !d.isCustomized
          return !isUnmodifiedBase
        })
        .map((d) => ({ ...d, isEquipped: d.dieType === 'cursed' ? true : false })),
    }))
  },

  equipBaseDie: (dieType) => {
    set((s) => {
      if (equippedOnly(s.inventory).length >= s.maxEquippedDice) return {}
      return { inventory: [...s.inventory, { ...createDie(dieType, uid()), isEquipped: true }] }
    })
  },

  startCombat: () => {
    const { unlockedNodes, inventory } = get()

    const vitI  = unlockedNodes.includes('fyuwvmzq') ? 10 : 0
    const vitII = unlockedNodes.includes('co2xusrh') ? 15 : 0
    const baseHp    = 100 + vitI + vitII
    const startSouls = unlockedNodes.includes('tqo6xv7r') ? 10 : 0

    const startInventory = unlockedNodes.includes('hnwdjqof')
      ? inventory.map((d) =>
          d.dieType !== 'white' ? d : {
            ...d,
            faces: d.faces.map((f) =>
              f.type === 'damage' && f.value === 1 ? { ...f, value: 2 } : f
            ),
          }
        )
      : inventory

    set((s) => ({
      turnPhase:    'idle',
      player:       { hp: baseHp, maxHp: baseHp, shield: 0 },
      inventory:    startInventory,
      runSouls:     startSouls,
      currentFloor: 1,
      enemy:        spawnEnemy(1),
      drawPile:     shuffleArray(equippedOnly(startInventory)),
      playedDice:   [],
      skullCount:   0,
      totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
      lastEffects:  { heal: 0, shield: 0, souls: 0 },
      rollStartVersion: s.rollStartVersion + 1,
      resolvingDieIndex: null, resolvingPhase: null,
      draftChoices: [], lockedDraftDice: [], lastSoulsEarned: 0,
      isChoosingNextDie: false,
      fortuneTellerPicksRemaining: 0,
      activeMultiplier: 1,
      usedSecondWind: false,
      firstAttackThisEncounter: true,
      rerollCost: 5,
      justDefeatedBoss: false,
      secondWindTriggered: false,
      showBossRewardModal: false,
      purifyUsesThisShop: 0,
    }))
  },

  drawAndRoll: async () => {
    const s = get()
    if (s.turnPhase !== 'idle' || s.drawPile.length === 0) return

    // Pick a random die and roll its face
    const randIdx   = Math.floor(Math.random() * s.drawPile.length)
    const drawn     = s.drawPile[randIdx]
    const face      = rollFace(drawn)
    const nextIndex = s.playedDice.length

    // Remove from draw pile, enter drawing phase
    set((st) => ({
      turnPhase: 'drawing',
      drawPile: st.drawPile.filter((_, i) => i !== randIdx),
      resolvingDieIndex: nextIndex,
      resolvingPhase: null,
    }))
    await sleep(40)

    // Stage 1 — Spin
    set((st) => ({
      playedDice: [...st.playedDice, { ...drawn, currentFace: undefined }],
      resolvingPhase: 'spinning',
    }))
    await sleep(300)

    // Stage 2 — Land: reveal face
    set((st) => ({
      playedDice: st.playedDice.map((d, i) =>
        i === nextIndex ? { ...d, currentFace: face } : d
      ),
      resolvingPhase: 'landed',
    }))
    await sleep(100)

    // Stage 3 — Orb fly
    set((st) => ({ orbVersion: st.orbVersion + 1 }))
    await sleep(150)

    // Stage 4 — Tally
    const mult          = s.activeMultiplier
    let   newSkullCount = s.skullCount

    if (face.type === 'multiplier') {
      set((st) => ({ activeMultiplier: face.value, counterVersion: st.counterVersion + 1 }))
      await sleep(75)
    } else {
      const isSkull       = face.type === 'skull'
      newSkullCount       = s.skullCount + (isSkull ? mult : 0)
      const lifestealGain = face.type === 'lifesteal' ? face.value * mult : 0
      const healGain      = face.type === 'heal'      ? face.value * mult : lifestealGain
      const shieldGain    = face.type === 'shield'    ? face.value * mult : 0
      const damageGain    = (face.type === 'damage' || face.type === 'lifesteal') ? face.value * mult : 0
      const soulsGain      = face.type === 'souls'     ? face.value * mult : 0
      const poisonGain    = face.type === 'poison'    ? face.value * mult : 0
      const multiplierFired = mult > 1

      set((st) => ({
        totalDamage: st.totalDamage + damageGain,
        totalHeal:   st.totalHeal   + healGain,
        totalShield: st.totalShield + shieldGain,
        totalSouls:   st.totalSouls   + soulsGain,
        totalPoison: st.totalPoison + poisonGain,
        skullCount:  newSkullCount,
        activeMultiplier: 1,
        counterVersion: st.counterVersion + 1,
        lastEffects: { heal: healGain, shield: shieldGain, souls: soulsGain },
        ...(multiplierFired ? { multiplierFiredVersion: st.multiplierFiredVersion + 1 } : {}),
        ...(isSkull ? { skullRolledVersion: st.skullRolledVersion + 1 } : {}),
        ...(healGain > 0 || shieldGain > 0 || soulsGain > 0
          ? { playerEffectVersion: st.playerEffectVersion + 1 }
          : {}),
      }))
      await sleep(75)
    }

    set({ resolvingDieIndex: null, resolvingPhase: null })

    // ── Bust check ──────────────────────────────────────────────────────
    if (newSkullCount >= 3) {
      // Animate damage/heal/gold counters to 0
      set((st) => ({
        totalDamage: 0,
        totalHeal:   0,
        totalSouls:   0,
        totalPoison: 0,
        counterVersion: st.counterVersion + 1,
      }))
      await sleep(300)

      // Brief player_attack phase: 0 damage, but keep accumulated shield
      const bustShield = get().totalShield
      set((st) => ({
        turnPhase: 'player_attack',
        player: { ...st.player, shield: st.player.shield + bustShield },
      }))
      await sleep(400)

      const bustDied1 = await applyBustPoisonTick()
      if (bustDied1) { await handleBustEnemyVictory() } else { await runEnemyPhase() }
      return
    }

    // Fortune Teller: open the choose-next modal if draw pile has dice remaining
    if (face.type === 'choose_next' && get().drawPile.length > 0) {
      const ftLimit = (drawn.mergeLevel ?? 0) + 1
      const picks   = Math.min(ftLimit, get().drawPile.length)
      set({ turnPhase: 'idle', isChoosingNextDie: true, fortuneTellerPicksRemaining: picks })
    } else {
      set({ turnPhase: 'idle' })
    }
  },

  drawSpecificDie: async (dieId: string) => {
    const s = get()
    if (s.turnPhase !== 'idle') return

    const dieIdx = s.drawPile.findIndex((d) => d.id === dieId)
    if (dieIdx === -1) return

    const drawn     = s.drawPile[dieIdx]
    const face      = rollFace(drawn)
    const nextIndex = s.playedDice.length

    set((st) => ({
      isChoosingNextDie: false,
      turnPhase: 'drawing',
      drawPile: st.drawPile.filter((_, i) => i !== dieIdx),
      resolvingDieIndex: nextIndex,
      resolvingPhase: null,
    }))
    await sleep(40)

    set((st) => ({
      playedDice: [...st.playedDice, { ...drawn, currentFace: undefined }],
      resolvingPhase: 'spinning',
    }))
    await sleep(300)

    set((st) => ({
      playedDice: st.playedDice.map((d, i) =>
        i === nextIndex ? { ...d, currentFace: face } : d
      ),
      resolvingPhase: 'landed',
    }))
    await sleep(100)

    set((st) => ({ orbVersion: st.orbVersion + 1 }))
    await sleep(150)

    const mult2          = s.activeMultiplier
    let   newSkullCount  = s.skullCount

    if (face.type === 'multiplier') {
      set((st) => ({ activeMultiplier: face.value, counterVersion: st.counterVersion + 1 }))
      await sleep(75)
    } else {
      const isSkull       = face.type === 'skull'
      newSkullCount       = s.skullCount + (isSkull ? mult2 : 0)
      const lifestealGain = face.type === 'lifesteal' ? face.value * mult2 : 0
      const healGain      = face.type === 'heal'      ? face.value * mult2 : lifestealGain
      const shieldGain    = face.type === 'shield'    ? face.value * mult2 : 0
      const damageGain    = (face.type === 'damage' || face.type === 'lifesteal') ? face.value * mult2 : 0
      const soulsGain      = face.type === 'souls'     ? face.value * mult2 : 0
      const poisonGain    = face.type === 'poison'    ? face.value * mult2 : 0
      const multiplierFired = mult2 > 1

      set((st) => ({
        totalDamage: st.totalDamage + damageGain,
        totalHeal:   st.totalHeal   + healGain,
        totalShield: st.totalShield + shieldGain,
        totalSouls:   st.totalSouls   + soulsGain,
        totalPoison: st.totalPoison + poisonGain,
        skullCount:  newSkullCount,
        activeMultiplier: 1,
        counterVersion: st.counterVersion + 1,
        lastEffects: { heal: healGain, shield: shieldGain, souls: soulsGain },
        ...(multiplierFired ? { multiplierFiredVersion: st.multiplierFiredVersion + 1 } : {}),
        ...(isSkull ? { skullRolledVersion: st.skullRolledVersion + 1 } : {}),
        ...(healGain > 0 || shieldGain > 0 || soulsGain > 0
          ? { playerEffectVersion: st.playerEffectVersion + 1 }
          : {}),
      }))
      await sleep(75)
    }

    set({ resolvingDieIndex: null, resolvingPhase: null })

    if (newSkullCount >= 3) {
      set((st) => ({
        totalDamage: 0, totalHeal: 0, totalSouls: 0, totalPoison: 0,
        counterVersion: st.counterVersion + 1,
      }))
      await sleep(300)

      const bustShield = get().totalShield
      set((st) => ({
        turnPhase: 'player_attack',
        player: { ...st.player, shield: st.player.shield + bustShield },
      }))
      await sleep(400)

      const bustDied2 = await applyBustPoisonTick()
      if (bustDied2) { await handleBustEnemyVictory() } else { await runEnemyPhase() }
      return
    }

    // Chained Fortune Teller: drawn die itself is a choose_next — start a fresh sequence
    if (face.type === 'choose_next' && get().drawPile.length > 0) {
      const ftLimit = (drawn.mergeLevel ?? 0) + 1
      const picks   = Math.min(ftLimit, get().drawPile.length)
      set({ turnPhase: 'idle', isChoosingNextDie: true, fortuneTellerPicksRemaining: picks })
      return
    }

    const picksLeft = get().fortuneTellerPicksRemaining
    if (picksLeft > 1 && get().drawPile.length > 0) {
      set({ turnPhase: 'idle', isChoosingNextDie: true, fortuneTellerPicksRemaining: picksLeft - 1 })
    } else {
      set({ turnPhase: 'idle', fortuneTellerPicksRemaining: 0 })
    }
  },

  bankAndAttack: async () => {
    if (get().turnPhase !== 'idle') return

    // Discard any dangling multiplier — it only applies within the same turn
    set({ activeMultiplier: 1 })

    const { totalDamage, totalHeal, totalShield, totalSouls, totalPoison, enemy, player,
            currentFloor, inventory, unlockedNodes, firstAttackThisEncounter, playedDice } = get()

    // First Blood: +1 damage on first bank of each encounter
    const firstBloodBonus = (unlockedNodes.includes('g1atjka6') && firstAttackThisEncounter) ? 1 : 0
    const effectiveDamage = totalDamage + firstBloodBonus
    if (firstAttackThisEncounter) set({ firstAttackThisEncounter: false })

    // Calculate max potential damage for animation tier
    let maxPotentialDamage = 0
    for (const die of inventory) {
      const maxDmg = die.faces
        .filter((f) => f.type === 'damage' || f.type === 'lifesteal')
        .reduce((m, f) => Math.max(m, f.value), 0)
      maxPotentialDamage += maxDmg
    }
    let tier: 1 | 2 | 3 = 1
    if (maxPotentialDamage > 0) {
      const pct = (effectiveDamage / maxPotentialDamage) * 100
      if (pct > 70) tier = 3
      else if (pct > 30) tier = 2
    }

    // Start attack animation phase — damage is NOT applied yet
    set({ turnPhase: 'player_attack', playerAttackAnimTier: tier, isChoosingNextDie: false })
    await sleep(800)

    // Apply damage after animation window (enemy shield absorbs first)
    const enemyShieldAbsorb = Math.min(enemy.shield ?? 0, effectiveDamage)
    let newEnemyHp    = Math.max(0, enemy.hp - (effectiveDamage - enemyShieldAbsorb))
    let newEnemyShield = Math.max(0, (enemy.shield ?? 0) - enemyShieldAbsorb)
    let newPlayerHp   = Math.min(player.maxHp, player.hp + totalHeal)
    let newShield     = player.shield + totalShield

    set((st) => ({
      playerAttackAnimTier: null,
      enemy:  { ...st.enemy,  hp: newEnemyHp, shield: newEnemyShield },
      player: { ...st.player, hp: newPlayerHp, shield: newShield },
      playerEffectVersion: st.playerEffectVersion + 1,
    }))

    // Thorns / Barbs recoil — only when enemy survived the hit, poison exempt
    if (newEnemyHp > 0) {
      const dmgFaces     = playedDice.filter(d => d.currentFace?.type === 'damage').length
      const thornsRecoil = Math.floor(effectiveDamage * (enemy.thorns ?? 0))
      const barbsRecoil  = dmgFaces * (enemy.barbs ?? 0)
      const totalRecoil  = thornsRecoil + barbsRecoil
      if (totalRecoil > 0) {
        const shieldAbsorb = Math.min(newShield, totalRecoil)
        newShield   = newShield - shieldAbsorb
        newPlayerHp = Math.max(0, newPlayerHp - (totalRecoil - shieldAbsorb))
        set((st) => ({
          player: { ...st.player, hp: newPlayerHp, shield: newShield },
          playerHitVersion: st.playerHitVersion + 1,
        }))
        await sleep(300)
        if (newPlayerHp <= 0) {
          const snap = get()
          if (snap.unlockedNodes.includes('7nescabs') && !snap.usedSecondWind) {
            const allB = [...ACT_1_BESTIARY, ...ACT_2_BESTIARY]
            const tmpl = allB.find(t => t.name === snap.enemy.name) ?? ACT_1_BESTIARY[1]
            const nxPh = (snap.enemy.intentPhase ?? 0) + 1
            const nxIn = rollIntent(tmpl, currentFloor, nxPh)
            set((st) => ({
              player: { ...st.player, hp: 20, shield: 0 },
              usedSecondWind: true, secondWindTriggered: true,
              turnPhase: 'idle',
              totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
              skullCount: 0,
              drawPile: shuffleArray(equippedOnly(st.inventory)),
              playedDice: [], lastEffects: { heal: 0, shield: 0, souls: 0 },
              resolvingDieIndex: null, resolvingPhase: null,
              rollStartVersion: st.rollStartVersion + 1,
              isChoosingNextDie: false, firstAttackThisEncounter: true,
              enemy: { ...st.enemy, intent: nxIn, intentPhase: nxPh, thorns: nxIn.type === 'thorns_activate' ? nxIn.value : (tmpl.thorns ?? 0) },
            }))
          } else {
            set({
              showGameOver: true, runSouls: 0,
              player: { hp: 100, maxHp: 100, shield: 0 },
              enemy: spawnEnemy(1), currentFloor: 1,
              totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
              skullCount: 0,
              inventory: INITIAL_INVENTORY.map(d => ({ ...d })),
              drawPile: [], playedDice: [],
              lastEffects: { heal: 0, shield: 0, souls: 0 },
              resolvingDieIndex: null, resolvingPhase: null,
              draftChoices: [], lastSoulsEarned: 0,
              isChoosingNextDie: false, turnPhase: 'loadout',
            })
          }
          return
        }
      }
    }

    if (newEnemyHp <= 0) {
      await sleep(450)

      // Double K.O.: player also at 0 — defeat takes priority over victory
      if (newPlayerHp <= 0) {
        set({
          showGameOver: true,
          runSouls: 0,
          player: { hp: 100, maxHp: 100, shield: 0 },
          enemy: spawnEnemy(1),
          currentFloor: 1,
          totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
          skullCount: 0,
          inventory: INITIAL_INVENTORY.map((d) => ({ ...d })),
          drawPile: [], playedDice: [],
          lastEffects: { heal: 0, shield: 0, souls: 0 },
          resolvingDieIndex: null, resolvingPhase: null,
          draftChoices: [], lastSoulsEarned: 0,
          isChoosingNextDie: false,
          turnPhase: 'loadout',
        })
        return
      }

      const isBossFloor = currentFloor % 5 === 0
      const bountyBonus = (unlockedNodes.includes('r9v5wdgh') && isBossFloor) ? 10 : 0
      const earned      = currentFloor * 5 + totalSouls + bountyBonus

      // Thick Skin: heal 15% of max HP after defeating a boss
      const thickSkinHeal = (isBossFloor && unlockedNodes.includes('aw2b29dw'))
        ? Math.floor(player.maxHp * 0.15) : 0

      if (isBossFloor && currentFloor === 15) {
        // Act 1 → Act 2 transition: bank all souls, enter culling phase
        set((st) => ({
          bankedSouls: st.bankedSouls + st.runSouls + earned,
          runSouls: 0,
          lastSoulsEarned: earned,
          turnPhase: 'inter_act_cull',
          player: { ...st.player, hp: Math.min(st.player.maxHp, st.player.hp + thickSkinHeal), shield: 0 },
          totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
          skullCount: 0,
          drawPile: [], playedDice: [],
          lastEffects: { heal: 0, shield: 0, souls: 0 },
          resolvingDieIndex: null, resolvingPhase: null,
          justDefeatedBoss: false,
        }))
      } else if (isBossFloor) {
        const curseId = uid()
        set((st) => ({
          inventory: [...st.inventory, { ...createDie('cursed', curseId), isEquipped: true as const }],
          runSouls: st.runSouls + earned,
          lastSoulsEarned: earned,
          turnPhase: 'shop',
          justDefeatedBoss: true,
          showBossRewardModal: true,
          purifyUsesThisShop: 0,
          player: { ...st.player, hp: Math.min(st.player.maxHp, st.player.hp + thickSkinHeal) },
          totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
          skullCount: 0,
          drawPile: [], playedDice: [],
          lastEffects: { heal: 0, shield: 0, souls: 0 },
          resolvingDieIndex: null, resolvingPhase: null,
        }))
      } else {
        const { lockedDraftDice, inventory } = get()
        const lockedTypes   = new Set(lockedDraftDice.map((d) => d.dieType))
        const ownedUniques  = new Set(inventory.filter((d) => UNIQUE_DIE_TYPES.has(d.dieType)).map((d) => d.dieType))
        const slotsToFill = 3 - lockedDraftDice.length
        const pool    = getDiceLootPool(unlockedNodes).filter((t) => !lockedTypes.has(t) && !ownedUniques.has(t))
        const newDice = shuffleArray([...pool])
                          .slice(0, slotsToFill)
                          .map((t) => createDie(t, uid()))
        const choices = [...lockedDraftDice, ...newDice]
        set((st) => ({
          runSouls: st.runSouls + earned,
          lastSoulsEarned: earned,
          draftChoices: choices,
          lockedDraftDice: [],
          rerollCost: 5,
          turnPhase: 'draft',
          totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
          skullCount: 0,
          drawPile: [], playedDice: [],
          lastEffects: { heal: 0, shield: 0, souls: 0 },
          resolvingDieIndex: null, resolvingPhase: null,
        }))
      }
      return
    }

    // ── Poison tick (before enemy attacks) ──────────────────────────────
    const stackedPoison = enemy.poison + totalPoison
    set((st) => ({ enemy: { ...st.enemy, poison: stackedPoison } }))

    if (stackedPoison > 0) {
      const postPoisonHp = Math.max(0, newEnemyHp - stackedPoison)
      set((st) => ({
        enemy: { ...st.enemy, hp: postPoisonHp },
        enemyHitVersion: st.enemyHitVersion + 1,
      }))
      await sleep(350)

      if (postPoisonHp <= 0) {
        await sleep(100)

        // Double K.O.: player also at 0 — defeat takes priority
        if (newPlayerHp <= 0) {
          set({
            showGameOver: true,
            runSouls: 0,
            player: { hp: 100, maxHp: 100, shield: 0 },
            enemy: spawnEnemy(1),
            currentFloor: 1,
            totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
            skullCount: 0,
            inventory: INITIAL_INVENTORY.map((d) => ({ ...d })),
            drawPile: [], playedDice: [],
            lastEffects: { heal: 0, shield: 0, souls: 0 },
            resolvingDieIndex: null, resolvingPhase: null,
            draftChoices: [], lastSoulsEarned: 0,
            isChoosingNextDie: false,
            turnPhase: 'loadout',
          })
          return
        }

        const isBossFloorP = currentFloor % 5 === 0
        const bountyBonusP = (unlockedNodes.includes('r9v5wdgh') && isBossFloorP) ? 10 : 0
        const earnedP      = currentFloor * 5 + totalSouls + bountyBonusP
        const thickSkinP   = (isBossFloorP && unlockedNodes.includes('aw2b29dw'))
          ? Math.floor(player.maxHp * 0.15) : 0

        if (isBossFloorP && currentFloor === 15) {
          // Act 1 → Act 2 transition: bank all souls, enter culling phase
          set((st) => ({
            bankedSouls: st.bankedSouls + st.runSouls + earnedP,
            runSouls: 0,
            lastSoulsEarned: earnedP,
            turnPhase: 'inter_act_cull',
            player: { ...st.player, hp: Math.min(st.player.maxHp, st.player.hp + thickSkinP), shield: 0 },
            totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
            skullCount: 0,
            drawPile: [], playedDice: [],
            lastEffects: { heal: 0, shield: 0, souls: 0 },
            resolvingDieIndex: null, resolvingPhase: null,
            justDefeatedBoss: false,
          }))
        } else if (isBossFloorP) {
          const curseId = uid()
          set((st) => ({
            inventory: [...st.inventory, { ...createDie('cursed', curseId), isEquipped: true as const }],
            runSouls: st.runSouls + earnedP,
            lastSoulsEarned: earnedP,
            turnPhase: 'shop',
            justDefeatedBoss: true,
            showBossRewardModal: true,
            purifyUsesThisShop: 0,
            player: { ...st.player, hp: Math.min(st.player.maxHp, st.player.hp + thickSkinP) },
            totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
            skullCount: 0,
            drawPile: [], playedDice: [],
            lastEffects: { heal: 0, shield: 0, souls: 0 },
            resolvingDieIndex: null, resolvingPhase: null,
          }))
        } else {
          const { lockedDraftDice, inventory: inv } = get()
          const lockedTypesP  = new Set(lockedDraftDice.map((d) => d.dieType))
          const ownedUniquesP = new Set(inv.filter((d) => UNIQUE_DIE_TYPES.has(d.dieType)).map((d) => d.dieType))
          const slotsP  = 3 - lockedDraftDice.length
          const poolP   = getDiceLootPool(unlockedNodes).filter((t) => !lockedTypesP.has(t) && !ownedUniquesP.has(t))
          const newDiceP = shuffleArray([...poolP]).slice(0, slotsP).map((t) => createDie(t, uid()))
          set((st) => ({
            runSouls: st.runSouls + earnedP,
            lastSoulsEarned: earnedP,
            draftChoices: [...lockedDraftDice, ...newDiceP],
            lockedDraftDice: [],
            rerollCost: 5,
            turnPhase: 'draft',
            totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
            skullCount: 0,
            drawPile: [], playedDice: [],
            lastEffects: { heal: 0, shield: 0, souls: 0 },
            resolvingDieIndex: null, resolvingPhase: null,
          }))
        }
        return
      }

      // Decay: reduce stack by 1
      set((st) => ({ enemy: { ...st.enemy, poison: Math.max(0, stackedPoison - 1) } }))
    }

    // Credit accumulated gold before runEnemyPhase clears it
    if (totalSouls > 0) {
      set((st) => ({ runSouls: st.runSouls + totalSouls }))
    }

    await sleep(400)
    await runEnemyPhase()
  },

  selectDraftDie: (dieId, lockedOtherIds) => {
    const { draftChoices, inventory, currentFloor } = get()
    const chosen = draftChoices.find((d) => d.id === dieId)
    if (!chosen) return
    const lockedUnselected = draftChoices.filter((d) => d.id !== dieId && lockedOtherIds.includes(d.id))
    const nextFloor = currentFloor + 1
    const newEnemy  = spawnEnemy(nextFloor)
    const chosenWithEquip = { ...chosen, isEquipped: true as const }
    const newInv    = [...inventory, chosenWithEquip]
    set((s) => ({
      inventory:    newInv,
      currentFloor: nextFloor,
      enemy:        newEnemy,
      player:       { ...s.player, shield: 0 },
      draftChoices: [],
      lockedDraftDice: lockedUnselected,
      drawPile:     shuffleArray(equippedOnly(newInv)),
      playedDice:   [],
      skullCount:   0,
      totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
      lastEffects:  { heal: 0, shield: 0, souls: 0 },
      resolvingDieIndex: null, resolvingPhase: null,
      rollStartVersion: s.rollStartVersion + 1,
      isChoosingNextDie: false,
      firstAttackThisEncounter: true,
      turnPhase:    'idle',
    }))
  },

  claimBossReward: () => { set({ showBossRewardModal: false }) },

  rerollDraft: (lockedDieIds) => {
    const { runSouls, rerollCost, unlockedNodes, draftChoices, inventory } = get()
    if (runSouls < rerollCost) return
    const lockedDice   = draftChoices.filter((d) => lockedDieIds.includes(d.id))
    const lockedTypes  = new Set(lockedDice.map((d) => d.dieType))
    const ownedUniques = new Set(inventory.filter((d) => UNIQUE_DIE_TYPES.has(d.dieType)).map((d) => d.dieType))
    const slotsToFill = 3 - lockedDice.length
    const pool    = getDiceLootPool(unlockedNodes).filter((t) => !lockedTypes.has(t) && !ownedUniques.has(t))
    const newDice = shuffleArray([...pool]).slice(0, slotsToFill).map((t) => createDie(t, uid()))
    set((s) => ({
      runSouls: s.runSouls - rerollCost,
      rerollCost: s.rerollCost + 5,
      draftChoices: [...lockedDice, ...newDice],
    }))
  },

  skipDraft: () => {
    const { inventory, currentFloor } = get()
    const nextFloor = currentFloor + 1
    const newEnemy  = spawnEnemy(nextFloor)
    set((s) => ({
      runSouls:     s.runSouls + 3,
      currentFloor: nextFloor,
      enemy:        newEnemy,
      player:       { ...s.player, shield: 0 },
      draftChoices: [],
      drawPile:     shuffleArray(equippedOnly(inventory)),
      playedDice:   [],
      skullCount:   0,
      totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
      lastEffects:  { heal: 0, shield: 0, souls: 0 },
      resolvingDieIndex: null, resolvingPhase: null,
      rollStartVersion: s.rollStartVersion + 1,
      isChoosingNextDie: false,
      firstAttackThisEncounter: true,
      turnPhase:    'idle',
    }))
  },

  shopHeal: (cost, amount) => {
    set((s) => {
      if (s.runSouls < cost || s.player.hp >= s.player.maxHp) return {}
      return {
        runSouls: s.runSouls - cost,
        player: { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + amount) },
      }
    })
  },

  shopModifyFace: (dieId, faceIndex, newFace, cost) => {
    set((s) => {
      if (s.runSouls < cost) return {}
      const isPurify = cost === 20
      if (isPurify && s.purifyUsesThisShop >= 3) return {}
      const newInventory = s.inventory.map((d) => {
        if (d.id !== dieId) return d
        return { ...d, faces: d.faces.map((f, i) => (i === faceIndex ? newFace : f)) }
      })
      return {
        runSouls: s.runSouls - cost,
        inventory: newInventory,
        ...(isPurify ? { purifyUsesThisShop: s.purifyUsesThisShop + 1 } : {}),
      }
    })
  },

  shopMergeDice: (die1Id, die2Id, cost) => {
    set((s) => {
      if (s.runSouls < cost) return {}
      const die1 = s.inventory.find((d) => d.id === die1Id)
      const die2 = s.inventory.find((d) => d.id === die2Id)
      if (!die1 || !die2) return {}
      if (die1.dieType === 'cursed' || die2.dieType === 'cursed') return {}
      if (die1.dieType === 'unique' || die2.dieType === 'unique') return {}
      const level1 = die1.mergeLevel ?? 0
      const level2 = die2.mergeLevel ?? 0
      if (level1 !== level2) return {}
      const bothJokers = die1.dieType === 'joker' && die2.dieType === 'joker'
      const jokerMerge = die1.dieType === 'joker' || die2.dieType === 'joker'
      if (!jokerMerge && die1.dieType !== die2.dieType) return {}
      if (bothJokers) {
        const newInventory = s.inventory
          .filter((d) => d.id !== die2Id)
          .map((d) => d.id !== die1Id ? d : { ...d, isMerged: true, mergeLevel: level1 + 1 })
        return { runSouls: s.runSouls - cost, inventory: newInventory }
      }
      // die1Id is always the first die the player selected — that is the Host.
      // Exception: if die1 is a Joker, the non-Joker is the Host (Joker is always material).
      const hostId     = die1.dieType === 'joker' ? die2Id : die1Id
      const materialId = die1.dieType === 'joker' ? die1Id : die2Id
      const newInventory = s.inventory
        .filter((d) => d.id !== materialId)
        .map((d) => {
          if (d.id !== hostId) return d
          return {
            ...d,
            isMerged: true,
            mergeLevel: level1 + 1,
            faces: d.faces.map((f) =>
              (f.type === 'skull' || f.type === 'blank' || f.type === 'purified_skull')
                ? f
                : { ...f, value: f.value * 3 }
            ),
          }
        })
      return { runSouls: s.runSouls - cost, inventory: newInventory }
    })
  },

  shopCraftFace: (dieId, faceIndex, newFace) => {
    set((s) => {
      if (s.runSouls < 20) return {}
      const newInventory = s.inventory.map((d) => {
        if (d.id !== dieId) return d
        return { ...d, isCustomized: true, faces: d.faces.map((f, i) => (i === faceIndex ? newFace : f)) }
      })
      return { runSouls: s.runSouls - 20, inventory: newInventory }
    })
  },

  shopPurifyFace: (dieId, faceIndex) => {
    set((s) => {
      if (s.runSouls < 10 || s.purifyUsesThisShop >= 3) return {}
      const newInventory = s.inventory.map((d) => {
        if (d.id !== dieId) return d
        return {
          ...d,
          isCustomized: true,
          faces: d.faces.map((f, i) => {
            if (i !== faceIndex) return f
            return f.type === 'skull'
              ? { type: 'purified_skull' as const, value: 0 }
              : { type: 'blank' as const, value: 0 }
          }),
        }
      })
      return { runSouls: s.runSouls - 10, inventory: newInventory, purifyUsesThisShop: s.purifyUsesThisShop + 1 }
    })
  },

  extractToBase: () => {
    const { runSouls } = get()
    set((s) => ({
      bankedSouls: s.bankedSouls + runSouls,
      runSouls: 0,
      player: { hp: 100, maxHp: 100, shield: 0 },
      enemy: spawnEnemy(1),
      currentFloor: 1,
      drawPile: [], playedDice: [],
      skullCount: 0,
      totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
      lastEffects: { heal: 0, shield: 0, souls: 0 },
      resolvingDieIndex: null, resolvingPhase: null,
      draftChoices: [], lockedDraftDice: [], lastSoulsEarned: 0,
      isChoosingNextDie: false,
      usedSecondWind: false,
      firstAttackThisEncounter: true,
      rerollCost: 5,
      justDefeatedBoss: false,
      secondWindTriggered: false,
      showBossRewardModal: false,
      purifyUsesThisShop: 0,
      turnPhase: 'loadout',
    }))
  },

  cullInventory: (selectedIds: string[]) => {
    const { inventory, player, rollStartVersion } = get()
    const selected = selectedIds
      .map((id) => inventory.find((d) => d.id === id))
      .filter((d): d is Die => d !== undefined)
      .map((d) => ({ ...d, isEquipped: true as const }))
    const curses = Array.from({ length: 3 }, () => ({
      ...createDie('cursed', uid()),
      isEquipped: true as const,
    }))
    const newInventory = [...selected, ...curses]
    set({
      inventory: newInventory,
      currentFloor: 16,
      turnPhase: 'idle',
      enemy: spawnEnemy(16),
      player: { ...player, shield: 0 },
      drawPile: shuffleArray(newInventory),
      playedDice: [],
      skullCount: 0,
      totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
      lastEffects: { heal: 0, shield: 0, souls: 0 },
      resolvingDieIndex: null, resolvingPhase: null,
      draftChoices: [], lockedDraftDice: [], lastSoulsEarned: 0,
      isChoosingNextDie: false,
      fortuneTellerPicksRemaining: 0,
      activeMultiplier: 1,
      firstAttackThisEncounter: true,
      justDefeatedBoss: false,
      rollStartVersion: rollStartVersion + 1,
    })
  },

  abandonRun: () => {
    set({
      player: { hp: 100, maxHp: 100, shield: 0 },
      enemy: spawnEnemy(1),
      currentFloor: 1,
      totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
      skullCount: 0,
      inventory: INITIAL_INVENTORY.map((d) => ({ ...d })),
      drawPile: [], playedDice: [],
      lastEffects: { heal: 0, shield: 0, souls: 0 },
      resolvingDieIndex: null, resolvingPhase: null,
      draftChoices: [], lastSoulsEarned: 0,
      runSouls: 0,
      isChoosingNextDie: false,
      usedSecondWind: false,
      firstAttackThisEncounter: true,
      playerAttackAnimTier: null,
      turnPhase: 'loadout',
    })
  },

  devJumpToForge: () => {
    const { unlockedNodes } = get()
    const vitI   = unlockedNodes.includes('fyuwvmzq') ? 10 : 0
    const vitII  = unlockedNodes.includes('co2xusrh') ? 15 : 0
    const baseHp = 100 + vitI + vitII

    function merged(type: DieType, level: number): Die {
      const die  = createDie(type, uid())
      const mult = Math.pow(3, level)
      return {
        ...die,
        isMerged: true,
        mergeLevel: level,
        isEquipped: true,
        faces: die.faces.map((f) =>
          (f.type === 'skull' || f.type === 'blank' || f.type === 'purified_skull')
            ? f
            : { ...f, value: f.value * mult }
        ),
      }
    }

    const STARTING_POOL: DieType[] = ['white', 'blue', 'green']
    const ADVANCED_POOL: DieType[] = [
      'heavy', 'paladin', 'gambler', 'scavenger', 'wall',
      'jackpot', 'vampire', 'priest', 'fortune_teller', 'joker', 'unique', 'blight',
    ]

    function pickWithReplacement(pool: DieType[], count: number): DieType[] {
      const result: DieType[] = []
      for (let i = 0; i < count; i++) result.push(pool[Math.floor(Math.random() * pool.length)])
      return result
    }

    // 16 regular dice: 7 starting + 9 advanced, 3 random merges
    const regularTypes  = [...pickWithReplacement(STARTING_POOL, 7), ...pickWithReplacement(ADVANCED_POOL, 9)]
    const mergeIndices  = new Set(shuffleArray([...Array(16).keys()]).slice(0, 3))
    const regularDice: Die[] = regularTypes.map((t, i) =>
      mergeIndices.has(i) ? merged(t, 1) : { ...createDie(t, uid()), isEquipped: true as const }
    )

    // 5 cursed dice with 6 of the 30 skull faces randomly purified
    const cursedFaces: DieFace[][] = Array.from({ length: 5 }, () =>
      Array.from({ length: 6 }, () => ({ type: 'skull' as const, value: 1 }))
    )
    const allSlots = cursedFaces.flatMap((_, di) =>
      [0, 1, 2, 3, 4, 5].map((fi) => [di, fi] as [number, number])
    )
    shuffleArray(allSlots).slice(0, 6).forEach(([di, fi]) => {
      cursedFaces[di][fi] = { type: 'purified_skull', value: 0 }
    })
    const cursedDice: Die[] = cursedFaces.map((faces) => ({
      ...createDie('cursed', uid()),
      isEquipped: true as const,
      faces,
    }))

    const inventory: Die[] = [...regularDice, ...cursedDice]

    set((s) => ({
      turnPhase:    'idle',
      player:       { hp: baseHp, maxHp: baseHp, shield: 0 },
      inventory,
      runSouls:     150,
      currentFloor: 15,
      enemy:        spawnEnemy(15),
      drawPile:     shuffleArray(inventory),
      playedDice:   [],
      skullCount:   0,
      totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
      lastEffects:  { heal: 0, shield: 0, souls: 0 },
      rollStartVersion: s.rollStartVersion + 1,
      resolvingDieIndex: null, resolvingPhase: null,
      draftChoices: [], lockedDraftDice: [], lastSoulsEarned: 0,
      isChoosingNextDie: false,
      usedSecondWind: false,
      firstAttackThisEncounter: true,
      rerollCost: 5,
      justDefeatedBoss: false,
      secondWindTriggered: false,
      showBossRewardModal: false,
      purifyUsesThisShop: 0,
      activeMultiplier: 1,
    }))
  },

  unlockNode: (nodeId) => {
    const { bankedSouls, unlockedNodes } = get()
    const node = SKILL_TREE_NODES.find((n) => n.id === nodeId)
    if (!node || bankedSouls < node.cost || unlockedNodes.includes(nodeId)) return
    set((s) => ({
      bankedSouls:     s.bankedSouls - node.cost,
      unlockedNodes: [...s.unlockedNodes, nodeId],
    }))
  },

  leaveShop: () => {
    const { currentFloor } = get()
    const nextFloor = currentFloor + 1
    const newEnemy  = spawnEnemy(nextFloor)
    set((s) => ({
      currentFloor: nextFloor,
      enemy:        newEnemy,
      player:       { ...s.player, shield: 0 },
      drawPile:     shuffleArray(equippedOnly(s.inventory)),
      playedDice:   [],
      skullCount:   0,
      totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
      lastEffects:  { heal: 0, shield: 0, souls: 0 },
      resolvingDieIndex: null, resolvingPhase: null,
      rollStartVersion: s.rollStartVersion + 1,
      isChoosingNextDie: false,
      firstAttackThisEncounter: true,
      turnPhase:    'idle',
    }))
  },

  toggleAutoBankDevMode: () => set(s => ({ isAutoBankDevMode: !s.isAutoBankDevMode })),
    }),
    {
      name: 'dice-dungeon-save',
      partialize: (state) => ({ bankedSouls: state.bankedSouls, unlockedNodes: state.unlockedNodes }),
    }
  )
)

// Extracted enemy phase — shared by bankAndAttack and bust
async function runEnemyPhase() {
  const { enemy, player, currentFloor } = useGameStore.getState()

  // ── Non-attack intents (shield buff, thorns activation) ──────────────────
  if (enemy.intent.type === 'shield' || enemy.intent.type === 'thorns_activate') {
    useGameStore.setState((st) => {
      const updatedEnemy = enemy.intent.type === 'shield'
        ? { ...st.enemy, shield: (st.enemy.shield ?? 0) + enemy.intent.value }
        : { ...st.enemy, thorns: enemy.intent.value }
      return { turnPhase: 'enemy_attack', enemyAttackVersion: st.enemyAttackVersion + 1, enemy: updatedEnemy }
    })
    await sleep(450)
    useGameStore.setState((s) => {
      const allB = [...ACT_1_BESTIARY, ...ACT_2_BESTIARY]
      const tmpl = allB.find(t => t.name === s.enemy.name) ?? ACT_1_BESTIARY[1]
      const nxPh = (s.enemy.intentPhase ?? 0) + 1
      const nxIn = rollIntent(tmpl, currentFloor, nxPh)
      return {
        turnPhase: 'idle',
        totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
        skullCount: 0,
        drawPile: shuffleArray(equippedOnly(s.inventory)),
        playedDice: [],
        lastEffects: { heal: 0, shield: 0, souls: 0 },
        player: { ...s.player, shield: 0 },
        enemy: { ...s.enemy, intent: nxIn, intentPhase: nxPh, thorns: nxIn.type === 'thorns_activate' ? nxIn.value : (tmpl.thorns ?? 0) },
        rollStartVersion: s.rollStartVersion + 1,
        isChoosingNextDie: false,
        firstAttackThisEncounter: true,
        resolvingDieIndex: null, resolvingPhase: null,
      }
    })
    return
  }

  // ── Attack intent ────────────────────────────────────────────────────────
  const eShield   = player.shield
  const rawDamage = enemy.intent.value
  let postHp: number
  let postShield: number
  if (enemy.corrosive) {
    // Corrosive: hits shield and HP simultaneously — shields provide no protection
    postHp    = Math.max(0, player.hp - rawDamage)
    postShield = Math.max(0, eShield - rawDamage)
  } else {
    const absorbed = Math.min(eShield, rawDamage)
    postHp    = Math.max(0, player.hp - (rawDamage - absorbed))
    postShield = eShield - absorbed
  }

  useGameStore.setState((st) => ({
    turnPhase: 'enemy_attack',
    enemyAttackVersion: st.enemyAttackVersion + 1,
  }))

  await sleep(240)

  useGameStore.setState((st) => ({
    player: { ...st.player, hp: postHp, shield: postShield },
    playerHitVersion: st.playerHitVersion + 1,
  }))

  await sleep(210)

  if (postHp <= 0) {
    const snap = useGameStore.getState()
    if (snap.unlockedNodes.includes('7nescabs') && !snap.usedSecondWind) {
      useGameStore.setState((st) => ({
        player: { ...st.player, hp: 20, shield: 0 },
        usedSecondWind: true,
        secondWindTriggered: true,
        turnPhase: 'idle',
        totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
        skullCount: 0,
        drawPile: shuffleArray(equippedOnly(st.inventory)),
        playedDice: [],
        lastEffects: { heal: 0, shield: 0, souls: 0 },
        resolvingDieIndex: null, resolvingPhase: null,
        rollStartVersion: st.rollStartVersion + 1,
        isChoosingNextDie: false,
        firstAttackThisEncounter: true,
        enemy: (() => {
          const allB = [...ACT_1_BESTIARY, ...ACT_2_BESTIARY]
          const tmpl = allB.find(t => t.name === st.enemy.name) ?? ACT_1_BESTIARY[1]
          const nxPh = (st.enemy.intentPhase ?? 0) + 1
          const nxIn = rollIntent(tmpl, st.currentFloor, nxPh)
          return { ...st.enemy, intent: nxIn, intentPhase: nxPh, thorns: nxIn.type === 'thorns_activate' ? nxIn.value : (tmpl.thorns ?? 0) }
        })(),
      }))
      return
    }
    useGameStore.setState({
      showGameOver: true,
      runSouls: 0,
      player: { hp: 100, maxHp: 100, shield: 0 },
      enemy: spawnEnemy(1),
      currentFloor: 1,
      totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
      skullCount: 0,
      inventory: INITIAL_INVENTORY.map((d) => ({ ...d })),
      drawPile: [], playedDice: [],
      lastEffects: { heal: 0, shield: 0, souls: 0 },
      resolvingDieIndex: null, resolvingPhase: null,
      draftChoices: [], lastSoulsEarned: 0,
      isChoosingNextDie: false,
      turnPhase: 'loadout',
    })
  } else {
    useGameStore.setState((s) => ({
      turnPhase: 'idle',
      totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
      skullCount: 0,
      drawPile: shuffleArray(equippedOnly(s.inventory)),
      playedDice: [],
      lastEffects: { heal: 0, shield: 0, souls: 0 },
      player: { ...s.player, shield: 0 },
      enemy: (() => {
        const allB = [...ACT_1_BESTIARY, ...ACT_2_BESTIARY]
        const tmpl = allB.find(t => t.name === s.enemy.name) ?? ACT_1_BESTIARY[1]
        const nxPh = (s.enemy.intentPhase ?? 0) + 1
        const nxIn = rollIntent(tmpl, currentFloor, nxPh)
        return { ...s.enemy, intent: nxIn, intentPhase: nxPh, thorns: nxIn.type === 'thorns_activate' ? nxIn.value : (tmpl.thorns ?? 0) }
      })(),
      rollStartVersion: s.rollStartVersion + 1,
      isChoosingNextDie: false,
      firstAttackThisEncounter: true,
      resolvingDieIndex: null, resolvingPhase: null,
    }))
  }
}

// Applies the existing enemy poison stack during a bust turn. Returns true if the enemy died.
async function applyBustPoisonTick(): Promise<boolean> {
  const { enemy } = useGameStore.getState()
  if (enemy.poison <= 0) return false
  const postHp = Math.max(0, enemy.hp - enemy.poison)
  useGameStore.setState((st) => ({
    enemy: { ...st.enemy, hp: postHp },
    enemyHitVersion: st.enemyHitVersion + 1,
  }))
  await sleep(350)
  useGameStore.setState((st) => ({ enemy: { ...st.enemy, poison: Math.max(0, enemy.poison - 1) } }))
  return postHp <= 0
}

// Handles the victory state transition when enemy dies during a bust poison tick.
async function handleBustEnemyVictory() {
  const { currentFloor, unlockedNodes, inventory, player, lockedDraftDice } = useGameStore.getState()
  const isBossFloor  = currentFloor % 5 === 0
  const bountyBonus  = (unlockedNodes.includes('r9v5wdgh') && isBossFloor) ? 10 : 0
  const earned       = currentFloor * 5 + bountyBonus
  const thickSkin    = (isBossFloor && unlockedNodes.includes('aw2b29dw'))
    ? Math.floor(player.maxHp * 0.15) : 0
  const resetFields = {
    totalDamage: 0, totalHeal: 0, totalShield: 0, totalSouls: 0, totalPoison: 0,
    skullCount: 0, drawPile: [] as Die[], playedDice: [] as Die[],
    lastEffects: { heal: 0, shield: 0, souls: 0 },
    resolvingDieIndex: null as null, resolvingPhase: null as null,
  }

  if (isBossFloor && currentFloor === 15) {
    useGameStore.setState((st) => ({
      ...resetFields,
      bankedSouls: st.bankedSouls + st.runSouls + earned,
      runSouls: 0, lastSoulsEarned: earned,
      turnPhase: 'inter_act_cull',
      player: { ...st.player, hp: Math.min(st.player.maxHp, st.player.hp + thickSkin), shield: 0 },
      justDefeatedBoss: false,
    }))
  } else if (isBossFloor) {
    const curseId = uid()
    useGameStore.setState((st) => ({
      ...resetFields,
      inventory: [...st.inventory, { ...createDie('cursed', curseId), isEquipped: true as const }],
      runSouls: st.runSouls + earned, lastSoulsEarned: earned,
      turnPhase: 'shop', justDefeatedBoss: true, showBossRewardModal: true, purifyUsesThisShop: 0,
      player: { ...st.player, hp: Math.min(st.player.maxHp, st.player.hp + thickSkin) },
    }))
  } else {
    const lockedTypes   = new Set(lockedDraftDice.map((d) => d.dieType))
    const ownedUniques  = new Set(inventory.filter((d) => UNIQUE_DIE_TYPES.has(d.dieType)).map((d) => d.dieType))
    const slots         = 3 - lockedDraftDice.length
    const pool          = getDiceLootPool(unlockedNodes).filter((t) => !lockedTypes.has(t) && !ownedUniques.has(t))
    const newDice       = shuffleArray([...pool]).slice(0, slots).map((t) => createDie(t, uid()))
    useGameStore.setState((st) => ({
      ...resetFields,
      runSouls: st.runSouls + earned, lastSoulsEarned: earned,
      draftChoices: [...lockedDraftDice, ...newDice],
      lockedDraftDice: [], rerollCost: 5, turnPhase: 'draft',
    }))
  }
}
