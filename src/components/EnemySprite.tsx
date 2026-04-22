// ── Color palette aliases ─────────────────────────────────────────────────────
const _ = null  // transparent

// Slime
const SC = '#22d3ee'  // cyan body
const SD = '#0891b2'  // dark edge
const SE = '#0e7490'  // eye / mouth

// Goblin
const GG = '#3a7a2a'  // green body
const GD = '#1e4716'  // dark shadow
const GE = '#fbbf24'  // eyes
const GM = '#dc2626'  // mouth
const GB = '#78350f'  // belt / boots

// Skeleton
const SW = '#e5e7eb'  // bone white
const SS = '#9ca3af'  // shadow gray
const SH = '#111827'  // hollow eye sockets
const ST = '#f3f4f6'  // teeth

// Orc
const OG = '#4d7c0f'  // olive green body
const OD = '#1a2e05'  // dark outline
const OY = '#fbbf24'  // yellow eyes
const OT = '#fef3c7'  // cream tusks
const OB = '#78350f'  // belt

// Demon
const DR = '#dc2626'  // red body
const DD = '#7f1d1d'  // dark red shadow
const DH = '#fbbf24'  // horn / glowing eyes
const DM = '#450a0a'  // dark mouth

// ── Pixel grids (10 cols × 12 rows unless noted) ──────────────────────────────

// Slime — round blob, no legs (blob body fades at bottom)
const SLIME: (string | null)[][] = [
  [_, _, _, SC, SC, SC, SC, _, _, _],
  [_, _, SC, SC, SC, SC, SC, SC, _, _],
  [_, SD, SC, SC, SC, SC, SC, SC, SD, _],
  [_, SC, SC, SC, SC, SC, SC, SC, SC, _],
  [_, SC, SC, SE, SC, SC, SE, SC, SC, _],  // eyes
  [_, SC, SC, SC, SC, SC, SC, SC, SC, _],
  [_, SC, SC, SC, SE, SE, SC, SC, SC, _],  // mouth
  [_, SC, SC, SC, SC, SC, SC, SC, SC, _],
  [_, _, SC, SC, SC, SC, SC, SC, _, _],
  [_, _, _, SC, SC, SC, SC, _, _, _],
  [_, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _],
]

// Goblin — existing design
const GOBLIN: (string | null)[][] = [
  [_, _, _, GD, GD, GD, GD, _, _, _],
  [_, _, GD, GG, GG, GG, GG, GD, _, _],
  [_, GD, GG, GG, GG, GG, GG, GG, GD, _],
  [_, GD, GG, GE, GG, GG, GE, GG, GD, _],
  [_, GD, GG, GG, GG, GG, GG, GG, GD, _],
  [_, GD, GG, GG, GM, GG, GM, GG, GD, _],
  [_, _, GD, GG, GG, GG, GG, GD, _, _],
  [GD, GG, GG, GG, GG, GG, GG, GG, GG, GD],
  [_, _, GG, GG, GB, GB, GG, GG, _, _],
  [_, _, GG, GG, GG, GG, GG, GG, _, _],
  [_, _, GG, GG, _, _, GG, GG, _, _],
  [_, _, GB, GB, _, _, GB, GB, _, _],
]

// Skeleton — bony, hollow eyes, visible ribs
const SKELETON: (string | null)[][] = [
  [_, _, _, SW, SW, SW, SW, _, _, _],
  [_, _, SW, SW, SW, SW, SW, SW, _, _],
  [_, SW, SW, SW, SW, SW, SW, SW, SW, _],
  [_, SW, SH, _, SW, SW, _, SH, SW, _],  // hollow eye sockets
  [_, SW, SW, SW, SW, SW, SW, SW, SW, _],
  [_, SW, ST, SW, ST, ST, SW, ST, SW, _],  // teeth
  [_, _, SW, SW, SW, SW, SW, SW, _, _],
  [_, SW, SS, SW, SS, SS, SW, SS, SW, _],  // ribs
  [_, SW, SW, SS, SW, SW, SS, SW, SW, _],  // ribs
  [_, SW, SW, SW, SW, SW, SW, SW, SW, _],
  [_, _, SW, SW, _, _, SW, SW, _, _],
  [_, _, SW, SW, _, _, SW, SW, _, _],
]

// Orc — wide chunky build, tusks
const ORC: (string | null)[][] = [
  [_, OD, OG, OG, OG, OG, OG, OG, OD, _],
  [OD, OG, OG, OG, OG, OG, OG, OG, OG, OD],
  [OD, OG, OG, OG, OG, OG, OG, OG, OG, OD],
  [OD, OG, OG, OY, OG, OG, OY, OG, OG, OD],  // yellow eyes
  [OD, OG, OG, OG, OG, OG, OG, OG, OG, OD],
  [OD, OG, OT, OG, _, _, OG, OT, OG, OD],    // tusks
  [OD, OG, OG, OG, OG, OG, OG, OG, OG, OD],
  [OD, OG, OG, OG, OG, OG, OG, OG, OG, OD],
  [_, OD, OG, OG, OB, OB, OG, OG, OD, _],    // belt
  [_, OD, OG, OG, OG, OG, OG, OG, OD, _],
  [_, _, OD, OG, _, _, OG, OD, _, _],
  [_, _, OD, OD, _, _, OD, OD, _, _],
]

// Demon (Boss) — 10×14, taller with horns
const DEMON: (string | null)[][] = [
  [DH, _, _, _, _, _, _, _, _, DH],          // horns
  [DH, DH, _, DR, DR, DR, DR, _, DH, DH],
  [_, _, DR, DR, DR, DR, DR, DR, _, _],
  [_, DR, DR, DR, DR, DR, DR, DR, DR, _],
  [_, DR, DR, DH, DR, DR, DH, DR, DR, _],   // glowing eyes
  [_, DR, DR, DR, DR, DR, DR, DR, DR, _],
  [_, DR, DR, DD, _, _, DD, DR, DR, _],     // dark nostrils
  [_, DR, DR, DR, DM, DM, DR, DR, DR, _],  // mouth
  [_, DR, DR, DR, DR, DR, DR, DR, DR, _],
  [DR, DR, DR, DR, DR, DR, DR, DR, DR, DR], // wide chest
  [DR, DR, DD, DD, DD, DD, DD, DD, DR, DR], // belt/plate
  [DR, DR, DR, DR, DR, DR, DR, DR, DR, DR],
  [_, _, DR, DR, _, _, DR, DR, _, _],       // legs
  [_, _, DD, DR, _, _, DR, DD, _, _],       // dark feet
]

// ── Sprite renderer ───────────────────────────────────────────────────────────

function Sprite({ grid, size }: { grid: (string | null)[][]; size: number }) {
  const cols = grid[0].length
  const rows = grid.length
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, ${size}px)`,
      gridTemplateRows: `repeat(${rows}, ${size}px)`,
      imageRendering: 'pixelated',
    }}>
      {grid.flat().map((color, i) => (
        <div key={i} style={{ width: size, height: size, background: color ?? 'transparent' }} />
      ))}
    </div>
  )
}

// ── EnemySprite ───────────────────────────────────────────────────────────────

export function EnemySprite({ enemyName, size = 6 }: { enemyName: string; size?: number }) {
  switch (enemyName.toLowerCase()) {
    case 'slime':    return <Sprite grid={SLIME}    size={size} />
    case 'goblin':   return <Sprite grid={GOBLIN}   size={size} />
    case 'skeleton': return <Sprite grid={SKELETON} size={size} />
    case 'orc':      return <Sprite grid={ORC}      size={size} />
    case 'demon':    return <Sprite grid={DEMON}    size={size} />
    default:         return <Sprite grid={GOBLIN}   size={size} />
  }
}
