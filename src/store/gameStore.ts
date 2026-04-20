import { create } from 'zustand'

// ── Core types ───────────────────────────────────────────────────────────────

export interface DieFace {
  type: 'damage' | 'shield' | 'heal'
  value: number
}

export type DieType = 'white' | 'blue' | 'green'

export interface Die {
  id: string
  dieType: DieType
  sides: number
  faces: DieFace[]
  currentFace?: DieFace
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
}

export type TurnPhase = 'loadout' | 'idle' | 'rolling' | 'player_attack' | 'enemy_attack'

// ── Die factory ──────────────────────────────────────────────────────────────
// To add a new die type: add one entry here. Nothing else needs to change.

const DIE_TEMPLATES: Record<DieType, { sides: number; faces: DieFace[]; rarity: Die['rarity'] }> = {
  white: {
    sides: 6,
    rarity: 'common',
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
    rarity: 'common',
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
    rarity: 'common',
    faces: [
      { type: 'heal', value: 1 },
      { type: 'heal', value: 2 },
      { type: 'heal', value: 3 },
      { type: 'damage', value: 1 },
      { type: 'damage', value: 2 },
      { type: 'damage', value: 3 },
    ],
  },
}

function createDie(type: DieType, id: string): Die {
  const t = DIE_TEMPLATES[type]
  return { id, dieType: type, sides: t.sides, faces: t.faces, rarity: t.rarity }
}

function rollFace(die: Die): DieFace {
  return die.faces[Math.floor(Math.random() * die.faces.length)]
}

// ── Store ────────────────────────────────────────────────────────────────────

interface GameState {
  player: { hp: number; maxHp: number; shield: number }
  enemy: { hp: number; maxHp: number; name: string; intent: null }
  inventory: Die[]
  equippedDice: Die[]
  totalDamage: number
  lastEffects: { heal: number; shield: number }
  turnPhase: TurnPhase
  enemyHitVersion: number
  playerHitVersion: number
  playerEffectVersion: number
  orbVersion: number
  counterVersion: number
  currentFloor: number
  currency: number
  equipDie: (id: string) => void
  unequipDie: (id: string) => void
  startCombat: () => void
  executeTurn: () => Promise<void>
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const ENEMY_DAMAGE = 10

export const useGameStore = create<GameState>((set, get) => ({
  player: { hp: 100, maxHp: 100, shield: 0 },
  enemy: { hp: 50, maxHp: 50, name: 'Goblin', intent: null },
  inventory: [
    createDie('white', 'w1'), createDie('white', 'w2'), createDie('white', 'w3'),
    createDie('white', 'w4'), createDie('white', 'w5'), createDie('white', 'w6'),
    createDie('blue',  'b1'), createDie('blue',  'b2'),
    createDie('green', 'g1'), createDie('green', 'g2'),
  ],
  equippedDice: [],
  totalDamage: 0,
  lastEffects: { heal: 0, shield: 0 },
  turnPhase: 'loadout',
  enemyHitVersion: 0,
  playerHitVersion: 0,
  playerEffectVersion: 0,
  orbVersion: 0,
  counterVersion: 0,
  currentFloor: 1,
  currency: 0,

  equipDie: (id) =>
    set((s) => {
      if (s.equippedDice.length >= 5) return s
      const die = s.inventory.find((d) => d.id === id)
      if (!die) return s
      return {
        inventory: s.inventory.filter((d) => d.id !== id),
        equippedDice: [...s.equippedDice, die],
      }
    }),

  unequipDie: (id) =>
    set((s) => {
      const die = s.equippedDice.find((d) => d.id === id)
      if (!die) return s
      return {
        equippedDice: s.equippedDice.filter((d) => d.id !== id),
        inventory: [...s.inventory, { ...die, currentFace: undefined }],
      }
    }),

  startCombat: () => set({ turnPhase: 'idle' }),

  executeTurn: async () => {
    // ── Phase: rolling ──────────────────────────────────────────────────
    set({ turnPhase: 'rolling', totalDamage: 0, lastEffects: { heal: 0, shield: 0 } })
    await sleep(80)

    const rolled = get().equippedDice.map((die) => ({
      ...die,
      currentFace: rollFace(die),
    }))

    const totalDamage  = rolled.reduce((n, d) => n + (d.currentFace?.type === 'damage' ? d.currentFace.value : 0), 0)
    const healAmount   = rolled.reduce((n, d) => n + (d.currentFace?.type === 'heal'   ? d.currentFace.value : 0), 0)
    const shieldAmount = rolled.reduce((n, d) => n + (d.currentFace?.type === 'shield' ? d.currentFace.value : 0), 0)

    set((s) => ({
      equippedDice: rolled, totalDamage, lastEffects: { heal: healAmount, shield: shieldAmount },
      orbVersion: s.orbVersion + 1,
    }))

    await sleep(500)  // orb flight

    set((s) => ({ counterVersion: s.counterVersion + 1 }))

    await sleep(480)  // counters animate before HP bars change

    // ── Phase: player_attack ────────────────────────────────────────────
    const { enemy, player } = get()
    const newEnemyHp  = Math.max(0, enemy.hp - totalDamage)
    const newPlayerHp = Math.min(player.maxHp, player.hp + healAmount)
    const newShield   = player.shield + shieldAmount

    set((s) => ({
      turnPhase: 'player_attack',
      enemy:  { ...s.enemy,  hp: newEnemyHp },
      player: { ...s.player, hp: newPlayerHp, shield: newShield },
      enemyHitVersion: s.enemyHitVersion + 1,
      playerEffectVersion: s.playerEffectVersion + 1,
    }))

    if (newEnemyHp <= 0) {
      await sleep(900)
      set((s) => ({
        enemy: { ...s.enemy, hp: s.enemy.maxHp },
        currentFloor: s.currentFloor + 1,
        totalDamage: 0,
        equippedDice: s.equippedDice.map((d) => ({ ...d, currentFace: undefined })),
        turnPhase: 'loadout',
      }))
      return
    }

    await sleep(800)

    // ── Phase: enemy_attack ─────────────────────────────────────────────
    const currentPlayer = get().player
    const shield = currentPlayer.shield
    const rawDamage = ENEMY_DAMAGE
    const absorbed = Math.min(shield, rawDamage)
    const newEnemyPlayerHp = Math.max(0, currentPlayer.hp - (rawDamage - absorbed))
    const newEnemyShield   = shield - absorbed

    set((s) => ({
      turnPhase: 'enemy_attack',
      player: { ...s.player, hp: newEnemyPlayerHp, shield: newEnemyShield },
      playerHitVersion: s.playerHitVersion + 1,
    }))

    await sleep(700)

    if (newEnemyPlayerHp <= 0) {
      set((s) => ({
        player: { hp: s.player.maxHp, maxHp: s.player.maxHp, shield: 0 },
        enemy:  { ...s.enemy, hp: s.enemy.maxHp },
        currentFloor: 1,
        totalDamage: 0,
        inventory: [
          createDie('white', 'w1'), createDie('white', 'w2'), createDie('white', 'w3'),
          createDie('white', 'w4'), createDie('white', 'w5'), createDie('white', 'w6'),
          createDie('blue',  'b1'), createDie('blue',  'b2'),
          createDie('green', 'g1'), createDie('green', 'g2'),
        ],
        equippedDice: [],
        turnPhase: 'loadout',
      }))
    } else {
      set((s) => ({
        totalDamage: 0,
        equippedDice: s.equippedDice.map((d) => ({ ...d, currentFace: undefined })),
        turnPhase: 'idle',
      }))
    }
  },
}))
