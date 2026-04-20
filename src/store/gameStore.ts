import { create } from 'zustand'

export interface DieFace {
  type: 'damage' | 'shield' | 'heal'
  value: number
}

export interface Die {
  id: string
  sides: number
  faces: DieFace[]
  currentValue?: number
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
}

export type TurnPhase = 'idle' | 'rolling' | 'player_attack' | 'enemy_attack'

interface GameState {
  player: { hp: number; maxHp: number; shield: number }
  enemy: { hp: number; maxHp: number; name: string; intent: null }
  dicePool: Die[]
  totalDamage: number
  turnPhase: TurnPhase
  enemyHitVersion: number
  playerHitVersion: number
  currentFloor: number
  currency: number
  executeTurn: () => Promise<void>
}

const STANDARD_D6_FACES: DieFace[] = [
  { type: 'damage', value: 2 },
  { type: 'damage', value: 2 },
  { type: 'damage', value: 3 },
  { type: 'shield', value: 1 },
  { type: 'shield', value: 2 },
  { type: 'heal', value: 1 },
]

function makeD6(id: string): Die {
  return { id, sides: 6, faces: STANDARD_D6_FACES, rarity: 'common' }
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const ENEMY_DAMAGE = 10

export const useGameStore = create<GameState>((set, get) => ({
  player: { hp: 100, maxHp: 100, shield: 0 },
  enemy: { hp: 50, maxHp: 50, name: 'Goblin', intent: null },
  dicePool: [
    makeD6('die-1'),
    makeD6('die-2'),
    makeD6('die-3'),
    makeD6('die-4'),
    makeD6('die-5'),
  ],
  totalDamage: 0,
  turnPhase: 'idle',
  enemyHitVersion: 0,
  playerHitVersion: 0,
  currentFloor: 1,
  currency: 0,

  executeTurn: async () => {
    // ── Phase: rolling ──────────────────────────────────────────────────
    set({ turnPhase: 'rolling', totalDamage: 0 })
    await sleep(80) // let the counter snap to 0 before new values render

    const rolled = get().dicePool.map((die) => ({
      ...die,
      currentValue: Math.ceil(Math.random() * die.sides),
    }))
    const newDamage = rolled.reduce((sum, d) => sum + (d.currentValue ?? 0), 0)
    set({ dicePool: rolled, totalDamage: newDamage })

    await sleep(1000) // wait for count-up animation

    // ── Phase: player_attack ────────────────────────────────────────────
    const enemyBefore = get().enemy
    const newEnemyHp = Math.max(0, enemyBefore.hp - newDamage)
    set((s) => ({
      turnPhase: 'player_attack',
      enemy: { ...s.enemy, hp: newEnemyHp },
      enemyHitVersion: s.enemyHitVersion + 1,
    }))

    if (newEnemyHp <= 0) {
      await sleep(900)
      set((s) => ({
        enemy: { ...s.enemy, hp: s.enemy.maxHp },
        currentFloor: s.currentFloor + 1,
        totalDamage: 0,
        turnPhase: 'idle',
      }))
      return
    }

    await sleep(800)

    // ── Phase: enemy_attack ─────────────────────────────────────────────
    const playerBefore = get().player
    const newPlayerHp = Math.max(0, playerBefore.hp - ENEMY_DAMAGE)
    set((s) => ({
      turnPhase: 'enemy_attack',
      player: { ...s.player, hp: newPlayerHp },
      playerHitVersion: s.playerHitVersion + 1,
    }))

    await sleep(700)

    if (newPlayerHp <= 0) {
      // Lose: reset the run
      set((s) => ({
        player: { ...s.player, hp: s.player.maxHp },
        enemy: { ...s.enemy, hp: s.enemy.maxHp },
        currentFloor: 1,
        totalDamage: 0,
        turnPhase: 'idle',
      }))
    } else {
      set({ totalDamage: 0, turnPhase: 'idle' })
    }
  },
}))
