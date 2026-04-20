import { motion } from 'framer-motion'
import { Swords, Shield, Heart } from 'lucide-react'
import type { Die, DieType, DieFace } from '../store/gameStore'

// ── Visual tables ────────────────────────────────────────────────────────────

export const dieTypeStyle: Record<DieType, { bg: string; shadow: string; text: string }> = {
  white: { bg: '#e2e2e2', shadow: '#666666', text: '#1a1a2e' },
  blue:  { bg: '#3b82f6', shadow: '#1e3a8a', text: '#ffffff' },
  green: { bg: '#4ade80', shadow: '#15803d', text: '#052e16' },
}

export const faceColor: Record<DieFace['type'], string> = {
  damage: '#dc2626',
  shield: '#38bdf8',
  heal:   '#22c55e',
}

export const faceShadow: Record<DieFace['type'], string> = {
  damage: '#7f1d1d',
  shield: '#1e3a8a',
  heal:   '#15803d',
}

// ── DiceFace: number + type icon ─────────────────────────────────────────────

function TypeIcon({ type, size = 13 }: { type: DieFace['type']; size?: number }) {
  const color = faceColor[type]
  if (type === 'damage') return <Swords  size={size} color={color} strokeWidth={2.5} />
  if (type === 'shield') return <Shield  size={size} color={color} strokeWidth={2.5} />
  return                        <Heart   size={size} color={color} strokeWidth={2.5} />
}

function DiceFace({ face, textColor }: { face: DieFace; textColor: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      width: '100%',
      height: '100%',
    }}>
      <span style={{
        fontSize: '1.6rem',
        fontWeight: 700,
        lineHeight: 1,
        color: textColor,
      }}>
        {face.value}
      </span>
      <TypeIcon type={face.type} size={16} />
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
  const maxFaceValue = Math.max(...die.faces.map(f => f.value))
  const isCrit = !!face && face.value === maxFaceValue

  return (
    <motion.div
      key={`${die.id}-${face?.type ?? 'none'}-${face?.value ?? 0}`}
      data-die-id={die.id}
      initial={{ scale: 0.6, rotate: -15, opacity: 0.5 }}
      animate={{ scale: 1, rotate: 0, opacity: dimmed ? 0.45 : 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      className="pixel-die"
      onClick={onClick}
      style={{
        position: 'relative',
        background: s.bg,
        boxShadow: `4px 4px 0 ${s.shadow}`,
        cursor: onClick ? 'pointer' : 'default',
        flexDirection: 'column',
      }}
    >
      {face
        ? <DiceFace face={face} textColor={s.text} />
        : <span style={{ fontSize: '1.5rem', fontWeight: 700, color: s.text }}>?</span>
      }
      {isCrit && (
        <motion.div
          style={{
            position: 'absolute', inset: -3,
            border: '3px solid #fbbf24',
            pointerEvents: 'none',
            zIndex: 1,
          }}
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
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
