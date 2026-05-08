import { useEffect, useRef, useState } from 'react'

const _ = null

type Pixel = string | null
type Grid = Pixel[][]
type Palette = Record<string, string>
type SheetMode = 'idle' | 'attack' | 'hurt' | 'death'
type SheetDefinition = { src: string; frames: number; frameMs: number; loop: boolean }
type SheetConfig = {
  sheets: Record<SheetMode, SheetDefinition>
  crop: { x: number; y: number; w: number; h: number }
  unit: number
  minWidth: number
  nudgeX?: number
}

function makeGrid(rows: string[], palette: Palette): Grid {
  const width = Math.max(...rows.map((row) => row.length))
  return rows.map((row) =>
    [...row.padEnd(width, '.')].map((key) => key === '.' ? _ : palette[key] ?? _)
  )
}

const common = {
  outline: '#14151f',
  shadow: '#23202a',
}

const palettes = {
  slime: {
    O: common.outline,
    S: common.shadow,
    D: '#166534',
    G: '#22c55e',
    L: '#86efac',
    H: '#dcfce7',
    E: '#052e16',
    M: '#14532d',
  },
  goblin: {
    O: common.outline,
    S: common.shadow,
    D: '#14532d',
    G: '#4ade80',
    L: '#86efac',
    E: '#facc15',
    R: '#991b1b',
    B: '#78350f',
    K: '#cbd5e1',
    W: '#e5e7eb',
  },
  skeleton: {
    O: common.outline,
    S: common.shadow,
    D: '#6b7280',
    B: '#cbd5e1',
    W: '#f8fafc',
    E: '#020617',
    R: '#991b1b',
    K: '#94a3b8',
  },
  orc: {
    O: common.outline,
    S: common.shadow,
    D: '#365314',
    G: '#65a30d',
    L: '#a3e635',
    E: '#fde047',
    T: '#fef3c7',
    B: '#92400e',
    A: '#64748b',
    K: '#cbd5e1',
  },
  demon: {
    O: common.outline,
    S: common.shadow,
    D: '#7f1d1d',
    R: '#dc2626',
    L: '#f87171',
    H: '#f59e0b',
    E: '#fde047',
    M: '#450a0a',
    P: '#581c87',
  },
  crawler: {
    O: common.outline,
    S: common.shadow,
    D: '#14532d',
    G: '#22c55e',
    L: '#84cc16',
    V: '#bef264',
    H: '#ecfccb',
    E: '#052e16',
    P: '#a855f7',
  },
  bat: {
    O: common.outline,
    S: common.shadow,
    D: '#334155',
    B: '#64748b',
    L: '#94a3b8',
    W: '#e5e7eb',
    E: '#f87171',
    R: '#7f1d1d',
  },
  creep: {
    O: common.outline,
    S: common.shadow,
    D: '#3f6212',
    G: '#84cc16',
    L: '#bef264',
    H: '#ecfccb',
    E: '#1a2e05',
    P: '#7e22ce',
    M: '#713f12',
  },
  behemoth: {
    O: common.outline,
    S: common.shadow,
    D: '#4c1d95',
    B: '#6d28d9',
    L: '#a78bfa',
    H: '#ddd6fe',
    E: '#f87171',
    K: '#f97316',
    M: '#2e1065',
  },
}

const SLIME_CRAWLER = makeGrid([
  '................',
  '.......OO.......',
  '....OODGGDOO....',
  '...ODGVLLVGDO...',
  '..ODGHHLLHHGDO..',
  '.OOGGVEGGEVGGO.',
  '.ODGGGLLGGGDO.',
  '..OGGGPPGGGGO...',
  '.OOOGGGGGGOOO...',
  'O...ODGGDO...O..',
  '....O....O......',
  '...O......O.....',
  '....SSSSSSSS....',
  '................',
  '................',
  '................',
], palettes.crawler)

const MARROW_BAT = makeGrid([
  '................',
  'O..............O',
  'BO............OB',
  'BBO....OO....OBB',
  'BLLBOOWWWWOOBLLB',
  'OBLLWEEWWEEWLLBO',
  '.OBLLWWWWWWLLBO.',
  '..OOBWWRRWWBOO..',
  '....OBWWWWBO....',
  '.....OBBBBO.....',
  '....O..BB..O....',
  '...O...BB...O...',
  '....SSSSSSSS....',
  '................',
  '................',
  '................',
], palettes.bat)

const MARROW_BAT_IDLE = [
  MARROW_BAT,
  makeGrid([
    '................',
    '.O............O.',
    'OB............BO',
    'OBBO...OO...OBBO',
    '.BLLBOWWWWO BLLB'.replaceAll(' ', 'O'),
    '.OBLLWEEWWEEWBO.',
    '..OBLLWWWWLLBO..',
    '...OBWWRRWWBO...',
    '....OBWWWWBO....',
    '....OOBBBBOO....',
    '.....O.BB.O.....',
    '....O..BB..O....',
    '....SSSSSSSS....',
    '................',
    '................',
    '................',
  ], palettes.bat),
  makeGrid([
    '................',
    '................',
    'O..............O',
    'BOO....OO....OOB',
    'BLLBOOWWWWOOBLLB',
    'OBLLWEEWWEEWLLBO',
    '.OBLLWWWWWWLLBO.',
    '..OOBWWRRWWBOO..',
    '....OBWWWWBO....',
    '.....OBBBBO.....',
    '....O..BB..O....',
    '...O...BB...O...',
    '....SSSSSSSS....',
    '................',
    '................',
    '................',
  ], palettes.bat),
]

const MARROW_BAT_ATTACK = [
  makeGrid([
    '................',
    '..O..........O..',
    '.OB.........OB..',
    '.OBBO..OO..OB...',
    '..BLLBOWWWWOBO..',
    '..OBLLWEEWWEO...',
    '...OBLLWWWWBO...',
    '....OBWWRRO....',
    '....OBWWBO.....',
    '...OOBBBBO.....',
    '..OB..BB.......',
    '.OB...BB.......',
    '....SSSSSS.....',
    '................',
    '................',
    '................',
  ], palettes.bat),
  makeGrid([
    '................',
    'O...............',
    'BO..............',
    'BBO....OO.......',
    'BLLBOOWWWWO.....',
    'OBLLWEEWWEEWO...',
    '.OBLLWWWWWWOOR..',
    '..OOBWWRRWWOORR.',
    '....OBWWWWBO....',
    '.....OBBBBO.....',
    '....O..BB.......',
    '...O...BB.......',
    '....SSSSSSS.....',
    '................',
    '................',
    '................',
  ], palettes.bat),
  makeGrid([
    '................',
    '..O............R',
    '.OB.........RRR.',
    '.OBBO..OO.RR....',
    '..BLLBOWWRR.....',
    '..OBLLWEEWWOO...',
    '...OBLLWWWWBO...',
    '....OBWWRRBO....',
    '....OBWWWWBO....',
    '.....OBBBBO.....',
    '....O..BB..O....',
    '...O...BB...O...',
    '....SSSSSSSS....',
    '................',
    '................',
    '................',
  ], palettes.bat),
  MARROW_BAT,
]

const MARROW_BAT_HURT = [
  makeGrid([
    '................',
    'O.............O.',
    'BO..........OB..',
    'BBO....OO..OBB..',
    'BLLBOOWWWWOOBL..',
    'OBLLWRRWWRRWBO..',
    '.OBLLWWWWWWBO...',
    '..OOBWWRRWBO....',
    '....OBWWWB.....',
    '.....OBBBO.....',
    '....O..BB......',
    '...O...BB......',
    '....SSSSSS.....',
    '................',
    '................',
    '................',
  ], palettes.bat),
  makeGrid([
    '................',
    '..O..........O..',
    '.OB........OB...',
    '..OB....OOOB....',
    '...OBOWRRWWO....',
    '....OWRRRRWO....',
    '....OBWWWWO.....',
    '...OOBWRRBO.....',
    '....OBWWBO......',
    '.....OBBO.......',
    '.....O.BB.......',
    '......OB........',
    '....SSSSS.......',
    '................',
    '................',
    '................',
  ], palettes.bat),
  MARROW_BAT,
]

const MARROW_BAT_DEATH = [
  MARROW_BAT,
  makeGrid([
    '................',
    '................',
    '.O............O.',
    '.BO....OO....OB.',
    '..BBOOWWWWOOBB..',
    '..OBLWEEWWEEBO..',
    '...OBLWWWWBO....',
    '....OBWRRBO.....',
    '.....BWWBO......',
    '....OBBBBO......',
    '...O..BB..O.....',
    '......BB........',
    '....SSSSSSS.....',
    '................',
    '................',
    '................',
  ], palettes.bat),
  makeGrid([
    '................',
    '................',
    '................',
    '..O..........O..',
    '...BO..OO..OB...',
    '...OBOWWWWOBO...',
    '....OBWWWWBO....',
    '.....BWRRBO.....',
    '....OBWWBO......',
    '...OBBBBO.......',
    '..O..BB..O......',
    '.....BB.........',
    '...SSSSSSSS.....',
    '................',
    '................',
    '................',
  ], palettes.bat),
  makeGrid([
    '................',
    '................',
    '................',
    '................',
    '....O......O....',
    '..OB....OO..BO..',
    '...OBOWWWWOBO...',
    '.....OBRRBO.....',
    '...OBBWWBBO.....',
    '..OBB.BB.BBO....',
    '.OB...BB...BO...',
    '................',
    '...SSSSSSSSS....',
    '................',
    '................',
    '................',
  ], palettes.bat),
  makeGrid([
    '................',
    '................',
    '................',
    '................',
    '................',
    '...O........O...',
    '.OB....OO....BO.',
    '...OBBWWWWBBO...',
    '..OBBWRRWWBBO...',
    '.OB...BB...BO...',
    '.....OBBO.......',
    '................',
    '...SSSSSSSSS....',
    '................',
    '................',
    '................',
  ], palettes.bat),
]

const GRID_ANIMATIONS: Record<'marrow bat', Record<SheetMode, { frames: Grid[]; frameMs: number; loop: boolean }>> = {
  'marrow bat': {
    idle: { frames: MARROW_BAT_IDLE, frameMs: 180, loop: true },
    attack: { frames: MARROW_BAT_ATTACK, frameMs: 95, loop: false },
    hurt: { frames: MARROW_BAT_HURT, frameMs: 120, loop: false },
    death: { frames: MARROW_BAT_DEATH, frameMs: 145, loop: false },
  },
}

const TOXIC_CREEP = makeGrid([
  '................',
  '.....OOOOOO.....',
  '...OODGGGLVO....',
  '..ODGLLHHLLGDO..',
  '.ODGVEGLLGEVGO.',
  '.OGGGLLLLGGGGO.',
  '.OGGGGPPGGGGGO.',
  '..OGGMMMMLGGO...',
  '...ODGGGGGDO....',
  '..OOOGDDGOOO....',
  '.O...ODDO...O...',
  '.....OPPO.......',
  '....SSSSSSSS....',
  '................',
  '................',
  '................',
], palettes.creep)

const SPIKED_BEHEMOTH = makeGrid([
  '..K...K..K...K..',
  '.KOK.OOOOO.KOK..',
  '.ODODBBBBBODDO..',
  'ODDBLLLLLLBDDO.',
  'ODBBHEBBEHBBBO.',
  'ODBBBBBBBBBBBO.',
  'ODBBBMKKMBBBBO.',
  'ODBBBBBBBBBBBO.',
  'ODDBBLMMBLBBDO.',
  '.ODBBBBBBBBBDO.',
  '.ODDBBBBBBBDDO.',
  '..ODDDBBBBDDO...',
  '...ODD..DDO....',
  '....SSSSSSSS....',
  '................',
  '................',
], palettes.behemoth)

function Sprite({ grid, size, boss = false }: { grid: Grid; size: number; boss?: boolean }) {
  const cols = grid[0].length
  const rows = grid.length
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, ${size}px)`,
      gridTemplateRows: `repeat(${rows}, ${size}px)`,
      imageRendering: 'pixelated',
      filter: boss
        ? 'drop-shadow(3px 3px 0 #000) drop-shadow(0 0 6px rgba(248,113,113,0.35))'
        : 'drop-shadow(2px 2px 0 #000)',
    }}>
      {grid.flat().map((color, i) => (
        <div key={i} style={{ width: size, height: size, background: color ?? 'transparent' }} />
      ))}
    </div>
  )
}

const SHEET_SPRITES: Record<'orc' | 'slime' | 'skeleton' | 'goblin' | 'demon', SheetConfig> = {
  orc: {
    sheets: {
      idle:   { src: '/sprites/enemies/orc/Orc-Idle.png?v=7',     frames: 6, frameMs: 190, loop: true },
      attack: { src: '/sprites/enemies/orc/Orc-Attack01.png?v=7', frames: 6, frameMs: 95,  loop: false },
      hurt:   { src: '/sprites/enemies/orc/Orc-Hurt.png?v=7',     frames: 4, frameMs: 130, loop: false },
      death:  { src: '/sprites/enemies/orc/Orc-Death.png?v=7',    frames: 4, frameMs: 150, loop: false },
    },
    crop: { x: 0, y: 8, w: 100, h: 84 },
    unit: 18,
    minWidth: 82,
  },
  slime: {
    sheets: {
      idle:   { src: '/sprites/enemies/slime/Slime-Idle.png',     frames: 6, frameMs: 190, loop: true },
      attack: { src: '/sprites/enemies/slime/Slime-Attack01.png', frames: 6, frameMs: 95,  loop: false },
      hurt:   { src: '/sprites/enemies/slime/Slime-Hurt.png',     frames: 4, frameMs: 130, loop: false },
      death:  { src: '/sprites/enemies/slime/Slime-Death.png',    frames: 4, frameMs: 150, loop: false },
    },
    crop: { x: 0, y: 18, w: 100, h: 64 },
    unit: 18,
    minWidth: 78,
  },
  skeleton: {
    sheets: {
      idle:   { src: '/sprites/enemies/skeleton/Skeleton-Idle.png',     frames: 6, frameMs: 190, loop: true },
      attack: { src: '/sprites/enemies/skeleton/Skeleton-Attack01.png', frames: 6, frameMs: 95,  loop: false },
      hurt:   { src: '/sprites/enemies/skeleton/Skeleton-Hurt.png',     frames: 4, frameMs: 130, loop: false },
      death:  { src: '/sprites/enemies/skeleton/Skeleton-Death.png',    frames: 4, frameMs: 150, loop: false },
    },
    crop: { x: 4, y: 10, w: 92, h: 82 },
    unit: 18,
    minWidth: 78,
  },
  goblin: {
    sheets: {
      idle:   { src: '/sprites/enemies/goblin/Goblin-Idle.png',     frames: 6, frameMs: 190, loop: true },
      attack: { src: '/sprites/enemies/goblin/Goblin-Attack01.png', frames: 6, frameMs: 95,  loop: false },
      hurt:   { src: '/sprites/enemies/goblin/Goblin-Hurt.png',     frames: 4, frameMs: 130, loop: false },
      death:  { src: '/sprites/enemies/goblin/Goblin-Death.png',    frames: 4, frameMs: 150, loop: false },
    },
    crop: { x: 0, y: 10, w: 100, h: 82 },
    unit: 18,
    minWidth: 78,
  },
  demon: {
    sheets: {
      idle:   { src: '/sprites/enemies/demon/Demon-Idle.png',     frames: 6, frameMs: 190, loop: true },
      attack: { src: '/sprites/enemies/demon/Demon-Attack01.png', frames: 6, frameMs: 100, loop: false },
      hurt:   { src: '/sprites/enemies/demon/Demon-Hurt.png',     frames: 4, frameMs: 130, loop: false },
      death:  { src: '/sprites/enemies/demon/Demon-Death.png',    frames: 4, frameMs: 170, loop: false },
    },
    crop: { x: 0, y: 4, w: 100, h: 92 },
    unit: 19,
    minWidth: 94,
  },
}

function SheetSprite({
  config,
  size,
  hp,
  enemyHitVersion = 0,
  enemyAttackVersion = 0,
}: {
  config: SheetConfig
  size: number
  hp?: number
  enemyHitVersion?: number
  enemyAttackVersion?: number
}) {
  const [mode, setMode] = useState<SheetMode>('idle')
  const [frame, setFrame] = useState(0)
  const prevHitVersion = useRef(enemyHitVersion)
  const prevAttackVersion = useRef(enemyAttackVersion)
  const isDead = hp !== undefined && hp <= 0

  useEffect(() => {
    if (isDead) {
      setMode('death')
      setFrame(0)
    }
  }, [isDead])

  useEffect(() => {
    if (enemyAttackVersion === prevAttackVersion.current) return
    prevAttackVersion.current = enemyAttackVersion
    if (isDead) return
    setMode('attack')
    setFrame(0)
  }, [enemyAttackVersion, isDead])

  useEffect(() => {
    if (enemyHitVersion === prevHitVersion.current) return
    prevHitVersion.current = enemyHitVersion
    setMode(isDead ? 'death' : 'hurt')
    setFrame(0)
  }, [enemyHitVersion, isDead])

  useEffect(() => {
    const sheet = config.sheets[mode]
    const id = window.setInterval(() => {
      setFrame((current) => {
        const next = current + 1
        if (next < sheet.frames) return next
        if (sheet.loop) return 0
        if (mode === 'death') return sheet.frames - 1
        setMode('idle')
        return 0
      })
    }, sheet.frameMs)

    return () => window.clearInterval(id)
  }, [config, mode])

  const sheet = config.sheets[mode]
  const { crop } = config
  const displayWidth = Math.max(config.minWidth, size * config.unit)
  const displayHeight = Math.round(displayWidth * (crop.h / crop.w))
  const scale = displayWidth / crop.w

  return (
    <div style={{
      width: displayWidth,
      height: displayHeight,
      overflow: 'visible',
      position: 'relative',
      transform: config.nudgeX ? `translateX(${config.nudgeX}px)` : undefined,
      filter: 'drop-shadow(2px 2px 0 #000)',
    }}>
      <div style={{
        width: crop.w,
        height: crop.h,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        backgroundImage: `url(${sheet.src})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: `-${frame * 100 + crop.x}px -${crop.y}px`,
        imageRendering: 'pixelated',
      }} />
    </div>
  )
}

function AnimatedGridSprite({
  animations,
  size,
  hp,
  enemyHitVersion = 0,
  enemyAttackVersion = 0,
}: {
  animations: Record<SheetMode, { frames: Grid[]; frameMs: number; loop: boolean }>
  size: number
  hp?: number
  enemyHitVersion?: number
  enemyAttackVersion?: number
}) {
  const [mode, setMode] = useState<SheetMode>('idle')
  const [frame, setFrame] = useState(0)
  const prevHitVersion = useRef(enemyHitVersion)
  const prevAttackVersion = useRef(enemyAttackVersion)
  const isDead = hp !== undefined && hp <= 0

  useEffect(() => {
    if (isDead) {
      setMode('death')
      setFrame(0)
    }
  }, [isDead])

  useEffect(() => {
    if (enemyAttackVersion === prevAttackVersion.current) return
    prevAttackVersion.current = enemyAttackVersion
    if (isDead) return
    setMode('attack')
    setFrame(0)
  }, [enemyAttackVersion, isDead])

  useEffect(() => {
    if (enemyHitVersion === prevHitVersion.current) return
    prevHitVersion.current = enemyHitVersion
    setMode(isDead ? 'death' : 'hurt')
    setFrame(0)
  }, [enemyHitVersion, isDead])

  useEffect(() => {
    const animation = animations[mode]
    const id = window.setInterval(() => {
      setFrame((current) => {
        const next = current + 1
        if (next < animation.frames.length) return next
        if (animation.loop) return 0
        if (mode === 'death') return animation.frames.length - 1
        setMode('idle')
        return 0
      })
    }, animation.frameMs)

    return () => window.clearInterval(id)
  }, [animations, mode])

  return <Sprite grid={animations[mode].frames[frame]} size={size} />
}

export function EnemySprite({
  enemyName,
  size = 6,
  hp,
  enemyHitVersion,
  enemyAttackVersion,
}: {
  enemyName: string
  size?: number
  hp?: number
  enemyHitVersion?: number
  enemyAttackVersion?: number
}) {
  const spriteSize = Math.max(3, size - 1)

  switch (enemyName.toLowerCase()) {
    case 'slime':
      return (
        <SheetSprite
          config={SHEET_SPRITES.slime}
          size={size}
          hp={hp}
          enemyHitVersion={enemyHitVersion}
          enemyAttackVersion={enemyAttackVersion}
        />
      )
    case 'goblin':
      return (
        <SheetSprite
          config={SHEET_SPRITES.goblin}
          size={size}
          hp={hp}
          enemyHitVersion={enemyHitVersion}
          enemyAttackVersion={enemyAttackVersion}
        />
      )
    case 'skeleton':
      return (
        <SheetSprite
          config={SHEET_SPRITES.skeleton}
          size={size}
          hp={hp}
          enemyHitVersion={enemyHitVersion}
          enemyAttackVersion={enemyAttackVersion}
        />
      )
    case 'orc':
      return (
        <SheetSprite
          config={SHEET_SPRITES.orc}
          size={size}
          hp={hp}
          enemyHitVersion={enemyHitVersion}
          enemyAttackVersion={enemyAttackVersion}
        />
      )
    case 'demon':
      return (
        <SheetSprite
          config={SHEET_SPRITES.demon}
          size={size}
          hp={hp}
          enemyHitVersion={enemyHitVersion}
          enemyAttackVersion={enemyAttackVersion}
        />
      )
    case 'slime crawler':
      return <Sprite grid={SLIME_CRAWLER} size={spriteSize} />
    case 'marrow bat':
      return (
        <AnimatedGridSprite
          animations={GRID_ANIMATIONS['marrow bat']}
          size={spriteSize}
          hp={hp}
          enemyHitVersion={enemyHitVersion}
          enemyAttackVersion={enemyAttackVersion}
        />
      )
    case 'toxic creep':
      return <Sprite grid={TOXIC_CREEP} size={spriteSize} />
    case 'spiked behemoth':
      return <Sprite grid={SPIKED_BEHEMOTH} size={spriteSize} boss />
    default:
      return <Sprite grid={MARROW_BAT} size={spriteSize} />
  }
}
