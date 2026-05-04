const _ = null

type Pixel = string | null
type Grid = Pixel[][]
type Palette = Record<string, string>

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

const SLIME = makeGrid([
  '................',
  '................',
  '......OOOO......',
  '....OODGGDOO....',
  '...ODGGLLGGDO...',
  '..ODGLLHHLLGDO..',
  '..OGGLGLLGLLGO..',
  '.ODGGEGLLGEGDO.',
  '.OGGGLLLLGGGGO.',
  '.OGGGGMMGGGGGO.',
  '..OGGGGGGGGGO..',
  '...ODGGGGGDO...',
  '.....OOOOOO.....',
  '....SSSSSSSS....',
  '................',
  '................',
], palettes.slime)

const GOBLIN = makeGrid([
  '................',
  '.....OOOOOO.....',
  '....ODGGGGDO....',
  '...ODGLLLLGDO...',
  '..OODGEGGEGDOO..',
  '.ODDGGGGGGDDO...',
  '.OGGGRRRRGGGO...',
  '..OGGBBBBGGO....',
  '...OGGGGGGO.....',
  '..OOGDGGDGO.....',
  '.OKKOD..DGO.....',
  'OKKOO....OO.....',
  '..K.......K.....',
  '....SSSSSSS.....',
  '................',
  '................',
], palettes.goblin)

const SKELETON = makeGrid([
  '................',
  '.....OOOOOO.....',
  '....OWWWWWO.....',
  '...OWWEEWWWO....',
  '...OWWWWWWWO....',
  '....OWBWBWO.....',
  '.....OWWWO......',
  '.....OBBBO..K...',
  '....OWBWBWOKK...',
  '...OWBWBWBOK....',
  '..OO..WB..O.....',
  '......WB........',
  '.....OWWO.......',
  '....SSSSSS......',
  '................',
  '................',
], palettes.skeleton)

const ORC = makeGrid([
  '................',
  '....OOOOOOOO....',
  '...ODGGGGGGDO...',
  '..ODGLLLLLLGDO..',
  '.OODGEGLLGEGDOO.',
  '.OGGGGGGGGGGGO..',
  '.OGGTGMMGTTGGO..',
  '..OGGGTTTGGGO...',
  '..ODGAAAAAGDO...',
  '...OGBBBBGGO....',
  '..OOGGGGGGOO....',
  '.OKKOD..DGO.....',
  'OKKO....OGO.....',
  '..K..SSSSSS.....',
  '................',
  '................',
], palettes.orc)

const DEMON = makeGrid([
  '...H........H...',
  '..HHH......HHH..',
  '..HOODDDDDOOH...',
  '...ODRRLLRRDO...',
  '..ODRREEEERRDO..',
  '..ODRLLLLLLRDO..',
  '.OODRRDMMDRROO.',
  '.OPDRRRMMRRDPO.',
  'OPPDRRRRRRDDPPO',
  'OPPDRPPPPPRDPPO',
  '..ODRRRRRRDO...',
  '..ODDRDDRDDO...',
  '...ODD..DDO....',
  '....SSSSSSS....',
  '................',
  '................',
], palettes.demon)

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

export function EnemySprite({ enemyName, size = 6 }: { enemyName: string; size?: number }) {
  const spriteSize = Math.max(3, size - 1)

  switch (enemyName.toLowerCase()) {
    case 'slime':
      return <Sprite grid={SLIME} size={spriteSize} />
    case 'goblin':
      return <Sprite grid={GOBLIN} size={spriteSize} />
    case 'skeleton':
      return <Sprite grid={SKELETON} size={spriteSize} />
    case 'orc':
      return <Sprite grid={ORC} size={spriteSize} />
    case 'demon':
      return <Sprite grid={DEMON} size={spriteSize} boss />
    case 'slime crawler':
      return <Sprite grid={SLIME_CRAWLER} size={spriteSize} />
    case 'marrow bat':
      return <Sprite grid={MARROW_BAT} size={spriteSize} />
    case 'toxic creep':
      return <Sprite grid={TOXIC_CREEP} size={spriteSize} />
    case 'spiked behemoth':
      return <Sprite grid={SPIKED_BEHEMOTH} size={spriteSize} boss />
    default:
      return <Sprite grid={GOBLIN} size={spriteSize} />
  }
}
