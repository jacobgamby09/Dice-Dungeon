import { motion } from 'framer-motion'
import type { Die, DieType, DieFace } from '../store/gameStore'

// ── Visual tables ────────────────────────────────────────────────────────────

export const dieTypeStyle: Record<DieType, { bg: string; shadow: string }> = {
  white: { bg: '#e2e2e2', shadow: '#666666' },
  blue:  { bg: '#3b82f6', shadow: '#1e3a8a' },
  green: { bg: '#4ade80', shadow: '#15803d' },
}

// Pip color by face type — color-codes the roll result
const pipColor: Record<DieFace['type'], string> = {
  damage: '#dc2626',
  shield: '#38bdf8',
  heal:   '#22c55e',
}

// Classic pip positions on a 3×3 grid (index 0–8, row-major)
//  0 1 2
//  3 4 5
//  6 7 8
const PIP_MAP: Record<number, number[]> = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

// ── DiceFace: 3×3 pip grid ───────────────────────────────────────────────────
// Die inner area: 64px outer − 6px border = 58px. Padding 6px each side → 46px
// grid. 3 cols × gap 3px → (46−6)/3 ≈ 13.3px per cell. Pip 8×8 fits cleanly.

function DiceFace({ face }: { face: DieFace }) {
  const active = PIP_MAP[face.value] ?? [4]
  const color  = pipColor[face.type]
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'repeat(3, 1fr)',
      gap: 3,
      padding: 6,
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
    }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {active.includes(i) && (
            <div style={{ width: 8, height: 8, background: color }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── DieCard ──────────────────────────────────────────────────────────────────

interface DieCardProps {
  die: Die
  onClick?: () => void
  dimmed?: boolean
}

export function DieCard({ die, onClick, dimmed = false }: DieCardProps) {
  const s = dieTypeStyle[die.dieType]
  const face = die.currentFace

  return (
    <motion.div
      key={`${die.id}-${face?.type ?? 'none'}-${face?.value ?? 0}`}
      initial={{ scale: 0.6, rotate: -15, opacity: 0.5 }}
      animate={{ scale: 1, rotate: 0, opacity: dimmed ? 0.45 : 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      className="pixel-die"
      onClick={onClick}
      style={{
        background: s.bg,
        boxShadow: `4px 4px 0 ${s.shadow}`,
        cursor: onClick ? 'pointer' : 'default',
        // override flex centering so pip grid can fill the interior
        alignItems: face ? 'stretch' : 'center',
        justifyContent: face ? 'stretch' : 'center',
        padding: 0,
      }}
    >
      {face
        ? <DiceFace face={face} />
        : <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e' }}>?</span>
      }
    </motion.div>
  )
}

// ── EmptySlot ────────────────────────────────────────────────────────────────

export function EmptySlot() {
  return (
    <div
      className="pixel-die"
      style={{
        background: 'transparent',
        border: '3px dashed #374151',
        boxShadow: 'none',
        color: '#374151',
        fontSize: '1.5rem',
      }}
    >
      +
    </div>
  )
}
