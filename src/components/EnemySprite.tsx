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

// ── Act 2 colour palettes ─────────────────────────────────────────────────────

// Thorned Beetle
const BK = '#1b3a1b'  // dark green body
const BL = '#2d6e2d'  // lighter green
const BS = '#8b5a00'  // brown spike / shell
const BE = '#ef4444'  // red eyes
const BD = '#0d200d'  // outline

// Porcupine
const PO = '#b45309'  // dark orange body
const PL = '#f97316'  // lighter orange
const PQ = '#d4d4d4'  // quill light
const PD = '#374151'  // quill dark
const PE = '#111827'  // nose

// Toxic Slime
const NC = '#4ade80'  // neon green body
const ND = '#16a34a'  // dark green edge
const NE = '#14532d'  // eye / mouth
const NB = '#86efac'  // light highlight

// Spiked Behemoth (Boss)
const HB = '#6d28d9'  // deep purple body
const HD = '#4c1d95'  // dark purple shadow
const HL = '#7c3aed'  // lighter purple
const HE = '#ef4444'  // red glowing eyes
const HK = '#1e1b4b'  // very dark spike tips
const HM = '#c026d3'  // pink energy markings

// ── Act 2 grids ──────────────────────────────────────────────────────────────

// Thorned Beetle — low armoured shell, symmetrical spikes
const THORNED_BEETLE: (string | null)[][] = [
  [_,  _,  BS, BD, BS, BS, BD, BS, _,  _ ],
  [_,  BD, BK, BK, BK, BK, BK, BK, BD, _ ],
  [BD, BK, BL, BE, BL, BL, BE, BL, BK, BD],
  [BD, BL, BS, BK, BS, BS, BK, BS, BL, BD],
  [BD, BK, BL, BL, BL, BL, BL, BL, BK, BD],
  [BD, BK, BK, BS, BK, BK, BS, BK, BK, BD],
  [_,  BD, BK, BK, BK, BK, BK, BK, BD, _ ],
  [_,  _,  BD, BK, BK, BK, BK, BD, _,  _ ],
  [_,  BD, _,  BK, BD, BD, BK, _,  BD, _ ],
  [_,  BD, _,  _,  BD, BD, _,  _,  BD, _ ],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _ ],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _ ],
]

// Porcupine — round body, spiky quill fan on top-back
const PORCUPINE: (string | null)[][] = [
  [_,  PQ, PD, _,  PQ, PD, _,  PD, PQ, _ ],
  [PQ, PD, PQ, PD, PQ, PD, PQ, PD, PQ, PD],
  [PD, PO, PO, PO, PO, PO, PO, PO, PO, PD],
  [_,  PO, PL, PO, PL, PL, PO, PL, PO, _ ],
  [_,  PL, PO, PL, PO, PO, PL, PO, PL, _ ],
  [_,  _,  PO, PO, PE, PE, PO, PO, _,  _ ],
  [_,  _,  PO, PO, PO, PO, PO, PO, _,  _ ],
  [_,  _,  PO, PL, PO, PO, PL, PO, _,  _ ],
  [_,  _,  PO, PO, _,  _,  PO, PO, _,  _ ],
  [_,  _,  PO, _,  _,  _,  _,  PO, _,  _ ],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _ ],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _ ],
]

// Toxic Slime — same blob shape as Slime, neon green + bubbles
const TOXIC_SLIME: (string | null)[][] = [
  [_,  _,  _,  NC, NC, NC, NC, _,  _,  _ ],
  [_,  _,  NC, NB, NB, NB, NB, NC, _,  _ ],
  [_,  ND, NC, NB, NC, NC, NB, NC, ND, _ ],
  [_,  NC, NC, NC, NC, NC, NC, NC, NC, _ ],
  [_,  NC, NB, NE, NC, NC, NE, NB, NC, _ ],
  [_,  NC, NC, NC, NC, NC, NC, NC, NC, _ ],
  [_,  NC, NC, NC, NE, NE, NC, NC, NC, _ ],
  [_,  NC, NC, NC, NC, NC, NC, NC, NC, _ ],
  [_,  _,  NB, NC, NC, NC, NC, NB, _,  _ ],
  [_,  _,  _,  NB, NB, NB, NB, _,  _,  _ ],
  [_,  _,  _,  _,  NC, NC, _,  _,  _,  _ ],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _ ],
]

// Spiked Behemoth (Boss) — 10×14, massive, purple, spike crown
const SPIKED_BEHEMOTH: (string | null)[][] = [
  [HK, _,  HK, _,  _,  _,  _,  HK, _,  HK],
  [HD, HK, HB, HK, HB, HB, HK, HB, HK, HD],
  [HD, HB, HL, HB, HB, HB, HB, HL, HB, HD],
  [HD, HB, HB, HE, HB, HB, HE, HB, HB, HD],
  [HD, HB, HB, HB, HB, HB, HB, HB, HB, HD],
  [HD, HB, HK, HD, HK, HK, HD, HK, HB, HD],
  [HD, HB, HB, HB, HB, HB, HB, HB, HB, HD],
  [HD, HB, HD, HM, HB, HB, HM, HD, HB, HD],
  [HD, HB, HB, HB, HK, HK, HB, HB, HB, HD],
  [HB, HB, HK, HB, HB, HB, HB, HK, HB, HB],
  [HB, HB, HB, HK, HB, HB, HK, HB, HB, HB],
  [HB, HD, HB, HB, HB, HB, HB, HB, HD, HB],
  [_,  HB, HB, _,  HB, HB, _,  HB, HB, _ ],
  [_,  HK, HD, _,  HK, HK, _,  HD, HK, _ ],
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
    case 'slime':            return <Sprite grid={SLIME}           size={size} />
    case 'goblin':           return <Sprite grid={GOBLIN}          size={size} />
    case 'skeleton':         return <Sprite grid={SKELETON}        size={size} />
    case 'orc':              return <Sprite grid={ORC}             size={size} />
    case 'demon':            return <Sprite grid={DEMON}           size={size} />
    case 'thorned beetle':   return <Sprite grid={THORNED_BEETLE}  size={size} />
    case 'porcupine':        return <Sprite grid={PORCUPINE}       size={size} />
    case 'toxic slime':      return <Sprite grid={TOXIC_SLIME}     size={size} />
    case 'spiked behemoth':  return <Sprite grid={SPIKED_BEHEMOTH} size={size} />
    default:                 return <Sprite grid={GOBLIN}          size={size} />
  }
}
