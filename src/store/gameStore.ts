import { create } from 'zustand'

// ── Core types ───────────────────────────────────────────────────────────────

export interface DieFace {
  type: 'damage' | 'shield' | 'heal' | 'skull'
  value: number
}

export type DieType = 'white' | 'blue' | 'green' | 'cursed'

export interface Die {
  id: string
  dieType: DieType
  sides: number
  faces: DieFace[]
  currentFace?: DieFace
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
}

export type TurnPhase = 'loadout' | 'idle' | 'drawing' | 'player_attack' | 'enemy_attack'
export type ResolvingPhase = 'spinning' | 'landed' | null

// ── Die factory ──────────────────────────────────────────────────────────────

export const DIE_TEMPLATES: Record<DieType, { sides: number; faces: DieFace[]; rarity: Die['rarity'] }> = {
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
  cursed: {
    sides: 6,
    rarity: 'uncommon',
    faces: [
      { type: 'skull', value: 1 },
      { type: 'skull', value: 1 },
      { type: 'skull', value: 1 },
      { type: 'skull', value: 1 },
      { type: 'skull', value: 1 },
      { type: 'skull', value: 1 },
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

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Store ────────────────────────────────────────────────────────────────────

export interface EnemyIntent { type: 'attack'; value: number }
export interface Enemy { hp: number; maxHp: number; name: string; intent: EnemyIntent; isBoss: boolean }

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
  lastEffects: { heal: number; shield: number }
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
  currency: number
  startCombat: () => void
  drawAndRoll: () => Promise<void>
  bankAndAttack: () => Promise<void>
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// ── Bestiary ─────────────────────────────────────────────────────────────────

interface EnemyTemplate {
  name: string; baseHp: number
  intentMin: number; intentMax: number; isBoss: boolean
}

const BESTIARY: EnemyTemplate[] = [
  { name: 'Slime',    baseHp: 30,  intentMin: 3,  intentMax: 5,  isBoss: false },
  { name: 'Goblin',   baseHp: 50,  intentMin: 6,  intentMax: 10, isBoss: false },
  { name: 'Skeleton', baseHp: 55,  intentMin: 2,  intentMax: 14, isBoss: false },
  { name: 'Orc',      baseHp: 80,  intentMin: 12, intentMax: 16, isBoss: false },
  { name: 'Demon',    baseHp: 150, intentMin: 20, intentMax: 30, isBoss: true  },
]

function rollIntent(template: EnemyTemplate, loop: number): EnemyIntent {
  const base = template.intentMin + Math.floor(Math.random() * (template.intentMax - template.intentMin + 1))
  return { type: 'attack', value: Math.round(base * (1 + loop * 0.3)) }
}

function spawnEnemy(floor: number): Enemy {
  const isBossFloor = floor % 5 === 0
  const loop        = Math.floor((floor - 1) / 5)
  const template    = isBossFloor ? BESTIARY[4] : BESTIARY[(floor - 1) % 4]
  const hp          = Math.round(template.baseHp * (1 + loop * 0.4))
  return { hp, maxHp: hp, name: template.name, intent: rollIntent(template, loop), isBoss: template.isBoss }
}

const INITIAL_INVENTORY: Die[] = [
  createDie('white',  'w1'), createDie('white',  'w2'), createDie('white',  'w3'),
  createDie('white',  'w4'),
  createDie('blue',   'b1'), createDie('blue',   'b2'),
  createDie('green',  'g1'),
  createDie('cursed', 'c1'), createDie('cursed', 'c2'), createDie('cursed', 'c3'),
]

export const useGameStore = create<GameState>((set, get) => ({
  player: { hp: 100, maxHp: 100, shield: 0 },
  enemy: spawnEnemy(1),
  inventory: INITIAL_INVENTORY.map((d) => ({ ...d })),
  drawPile: [],
  playedDice: [],
  skullCount: 0,
  totalDamage: 0,
  totalHeal: 0,
  totalShield: 0,
  lastEffects: { heal: 0, shield: 0 },
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
  currency: 0,

  startCombat: () => set((s) => ({
    turnPhase: 'idle',
    drawPile: shuffleArray([...s.inventory]),
    playedDice: [],
    skullCount: 0,
    totalDamage: 0, totalHeal: 0, totalShield: 0,
    lastEffects: { heal: 0, shield: 0 },
    rollStartVersion: s.rollStartVersion + 1,
    resolvingDieIndex: null, resolvingPhase: null,
  })),

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
    const isSkull     = face.type === 'skull'
    const newSkullCount = s.skullCount + (isSkull ? 1 : 0)
    const healGain    = face.type === 'heal'   ? face.value : 0
    const shieldGain  = face.type === 'shield' ? face.value : 0
    const damageGain  = face.type === 'damage' ? face.value : 0

    set((st) => ({
      totalDamage: st.totalDamage + damageGain,
      totalHeal:   st.totalHeal   + healGain,
      totalShield: st.totalShield + shieldGain,
      skullCount:  newSkullCount,
      counterVersion: st.counterVersion + 1,
      lastEffects: { heal: healGain, shield: shieldGain },
      ...(isSkull ? { skullRolledVersion: st.skullRolledVersion + 1 } : {}),
      ...(healGain > 0 || shieldGain > 0
        ? { playerEffectVersion: st.playerEffectVersion + 1 }
        : {}),
    }))
    await sleep(75)

    set({ resolvingDieIndex: null, resolvingPhase: null })

    // ── Bust check ──────────────────────────────────────────────────────
    if (newSkullCount >= 3) {
      // Animate damage/heal counters to 0
      set((st) => ({
        totalDamage: 0,
        totalHeal:   0,
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

      await runEnemyPhase()
      return
    }

    set({ turnPhase: 'idle' })
  },

  bankAndAttack: async () => {
    if (get().turnPhase !== 'idle') return

    const { totalDamage, totalHeal, totalShield, enemy, player } = get()
    const newEnemyHp  = Math.max(0, enemy.hp - totalDamage)
    const newPlayerHp = Math.min(player.maxHp, player.hp + totalHeal)
    const newShield   = player.shield + totalShield

    set((st) => ({
      turnPhase: 'player_attack',
      enemy:  { ...st.enemy,  hp: newEnemyHp },
      player: { ...st.player, hp: newPlayerHp, shield: newShield },
      enemyHitVersion: st.enemyHitVersion + 1,
      playerEffectVersion: st.playerEffectVersion + 1,
    }))

    if (newEnemyHp <= 0) {
      await sleep(450)
      set((st) => ({
        enemy: spawnEnemy(st.currentFloor + 1),
        player: { ...st.player, shield: 0 },
        currentFloor: st.currentFloor + 1,
        totalDamage: 0, totalHeal: 0, totalShield: 0,
        skullCount: 0,
        drawPile: [], playedDice: [],
        lastEffects: { heal: 0, shield: 0 },
        resolvingDieIndex: null, resolvingPhase: null,
        turnPhase: 'loadout',
      }))
      return
    }

    await sleep(400)
    await runEnemyPhase()
  },
}))

// Extracted enemy phase — shared by bankAndAttack and bust
async function runEnemyPhase() {
  const { enemy, player, currentFloor } = useGameStore.getState()

  // Read shield from store — already applied during player_attack phase
  const eShield   = player.shield
  const rawDamage = enemy.intent.value
  const absorbed  = Math.min(eShield, rawDamage)
  const postHp    = Math.max(0, player.hp - (rawDamage - absorbed))
  const postShield = eShield - absorbed

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
    useGameStore.setState({
      player: { hp: 100, maxHp: 100, shield: 0 },
      enemy: spawnEnemy(1),
      currentFloor: 1,
      totalDamage: 0, totalHeal: 0, totalShield: 0,
      skullCount: 0,
      inventory: INITIAL_INVENTORY.map((d) => ({ ...d })),
      drawPile: [], playedDice: [],
      lastEffects: { heal: 0, shield: 0 },
      resolvingDieIndex: null, resolvingPhase: null,
      turnPhase: 'loadout',
    })
  } else {
    useGameStore.setState((s) => ({
      turnPhase: 'idle',
      totalDamage: 0, totalHeal: 0, totalShield: 0,
      skullCount: 0,
      drawPile: shuffleArray([...s.inventory]),
      playedDice: [],
      lastEffects: { heal: 0, shield: 0 },
      player: { ...s.player, shield: 0 },
      enemy: {
        ...s.enemy,
        intent: rollIntent(
          BESTIARY.find((t) => t.name === s.enemy.name) ?? BESTIARY[1],
          Math.floor((currentFloor - 1) / 5)
        ),
      },
      rollStartVersion: s.rollStartVersion + 1,
      resolvingDieIndex: null, resolvingPhase: null,
    }))
  }
}
