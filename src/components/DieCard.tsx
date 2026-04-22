import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Swords, Shield, Heart, Skull } from 'lucide-react'
import type { Die, DieType, DieFace, ResolvingPhase } from '../store/gameStore'

// ── Visual tables ────────────────────────────────────────────────────────────

export const dieTypeStyle: Record<DieType, { bg: string; shadow: string; text: string }> = {
  white:  { bg: '#e2e2e2', shadow: '#666666', text: '#1a1a2e' },
  blue:   { bg: '#3b82f6', shadow: '#1e3a8a', text: '#ffffff' },
  green:  { bg: '#4ade80', shadow: '#15803d', text: '#052e16' },
  cursed: { bg: '#581c87', shadow: '#3b0764', text: '#f5d0fe' },
}

export const faceColor: Record<DieFace['type'], string> = {
  damage: '#dc2626',
  shield: '#38bdf8',
  heal:   '#22c55e',
  skull:  '#7c3aed',
}

export const faceShadow: Record<DieFace['type'], string> = {
  damage: '#7f1d1d',
  shield: '#1e3a8a',
  heal:   '#15803d',
  skull:  '#3b0764',
}

// ── Type icon ────────────────────────────────────────────────────────────────

function TypeIcon({ type, size = 13 }: { type: DieFace['type']; size?: number }) {
  const color = faceColor[type]
  if (type === 'damage') return <Swords size={size} color={color} strokeWidth={2.5} />
  if (type === 'shield') return <Shield size={size} color={color} strokeWidth={2.5} />
  if (type === 'skull')  return <Skull  size={size} color={color} strokeWidth={2.5} />
  return                        <Heart  size={size} color={color} strokeWidth={2.5} />
}

// ── DiceFace ─────────────────────────────────────────────────────────────────

function DiceFace({ face, textColor }: { face: DieFace; textColor: string }) {
  if (face.type === 'skull') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <TypeIcon type="skull" size={28} />
      </div>
    )
  }
  return (
    <div style={{
      display: 'flex', flexDirection: 'row',
      alignItems: 'center', justifyContent: 'center',
      gap: 5, width: '100%', height: '100%',
    }}>
      <span style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1, color: textColor }}>
        {face.value}
      </span>
      <TypeIcon type={face.type} size={16} />
    </div>
  )
}

// ── Particle burst ────────────────────────────────────────────────────────────

function ParticleBurst({ faceType, isCrit }: { faceType: DieFace['type']; isCrit: boolean }) {
  const count     = isCrit ? 12 : 7
  const baseSize  = isCrit ? 7  : 4
  const color     = isCrit ? '#fbbf24' : faceColor[faceType]
  const shadow    = isCrit ? '#78350f' : faceShadow[faceType]
  const baseDist  = isCrit ? 46 : 28
  const dur       = isCrit ? 0.55 : 0.38

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i + (i % 2 === 0 ? 7 : -7)
        const dist  = baseDist + (i % 3) * 6
        const rad   = (angle * Math.PI) / 180
        const sz    = baseSize + (i % 2)
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: sz, height: sz,
              background: color,
              border: `1px solid ${shadow}`,
              top: '50%', left: '50%',
              marginTop: -sz / 2, marginLeft: -sz / 2,
              pointerEvents: 'none',
              zIndex: 30,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(rad) * dist, y: Math.sin(rad) * dist, opacity: 0, scale: 0.4 }}
            transition={{ duration: dur, ease: 'easeOut', delay: i * 0.012 }}
          />
        )
      })}
    </>
  )
}

// ── DieCard ──────────────────────────────────────────────────────────────────

interface DieCardProps {
  die: Die
  onClick?: () => void
  dimmed?: boolean
  isResolving?: boolean
  resolvingPhase?: ResolvingPhase
}

export function DieCard({
  die, onClick, dimmed = false, isResolving = false, resolvingPhase = null,
}: DieCardProps) {
  const s           = dieTypeStyle[die.dieType]
  const face        = die.currentFace
  const maxFaceVal  = Math.max(...die.faces.map(f => f.value))
  const isCrit      = !!face && face.value === maxFaceVal

  const isSpinning = isResolving && resolvingPhase === 'spinning'
  const isLanded   = isResolving && resolvingPhase === 'landed'

  // Rapidly cycle faces during spin
  const [spinFace, setSpinFace] = useState<DieFace | null>(null)
  useEffect(() => {
    if (!isSpinning) { setSpinFace(null); return }
    const id = setInterval(() => {
      setSpinFace(die.faces[Math.floor(Math.random() * die.faces.length)])
    }, 75)
    return () => clearInterval(id)
  }, [isSpinning])

  // Particle burst on impact
  const [burst, setBurst] = useState(false)
  const prevLanded = useRef(false)
  useEffect(() => {
    if (isLanded && !prevLanded.current) {
      setBurst(true)
      const t = setTimeout(() => setBurst(false), 700)
      return () => clearTimeout(t)
    }
    prevLanded.current = isLanded
  }, [isLanded])

  // Outer wrapper: lift (spin) → slam (land) → rest
  const outerAnimate = isSpinning
    ? { y: -54, filter: 'blur(2.5px)', rotateY: 360, scale: 1 }
    : isLanded
    ? { y: 0,   filter: 'blur(0px)',   rotateY: 0,   scale: [0.78, 1.18, 1] as number[] }
    : { y: 0,   filter: 'blur(0px)',   rotateY: 0,   scale: 1 }

  const outerTransition = isSpinning
    ? {
        y:       { duration: 0.22, ease: 'easeOut' },
        filter:  { duration: 0.15 },
        rotateY: { duration: 0.22, repeat: Infinity, ease: 'linear' },
        scale:   { duration: 0.12 },
      }
    : isLanded
    ? {
        y:       { type: 'spring', stiffness: 900, damping: 22 },
        scale:   { duration: 0.32, ease: [0.15, 0, 0.1, 1.9] },
        filter:  { duration: 0.08 },
        rotateY: { duration: 0.12 },
      }
    : { duration: 0.22 }

  // Inner die: bouncy spring on land (natural overshoot = flair)
  const innerInitial = isLanded
    ? { scale: 0.35, rotate: -6, opacity: 0.7 }
    : { scale: 0.6,  rotate: -15, opacity: 0.5 }

  const innerTransition = isLanded
    ? { type: 'spring', stiffness: 360, damping: 9, mass: 0.55 } as const
    : { type: 'spring', stiffness: 500, damping: 18 } as const

  const displayFace = isSpinning ? spinFace : face

  return (
    <motion.div
      data-die-id={die.id}
      style={{ display: 'inline-block', position: 'relative', transformPerspective: 600 }}
      animate={outerAnimate}
      transition={outerTransition}
    >
      <motion.div
        key={`${die.id}-${face?.type ?? 'none'}-${face?.value ?? 0}`}
        initial={innerInitial}
        animate={{ scale: 1, rotate: 0, opacity: dimmed ? 0.45 : 1 }}
        transition={innerTransition}
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
        {displayFace
          ? <DiceFace face={displayFace} textColor={s.text} />
          : <span style={{ fontSize: '1.5rem', fontWeight: 700, color: s.text }}>?</span>
        }

        {/* Crit pulsing border */}
        {isCrit && !isSpinning && (
          <motion.div
            style={{
              position: 'absolute', inset: -3,
              border: '3px solid #fbbf24',
              pointerEvents: 'none', zIndex: 1,
            }}
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Crit sparkle radial flash on land */}
        {isLanded && isCrit && (
          <motion.div
            style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at center, rgba(251,191,36,0.9) 0%, transparent 70%)',
              pointerEvents: 'none', zIndex: 5,
            }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 0], scale: [0.4, 1.4, 1] }}
            transition={{ duration: 0.46, ease: 'easeOut' }}
          />
        )}

        {/* Impact particle burst */}
        {burst && face && <ParticleBurst faceType={face.type} isCrit={isCrit} />}
      </motion.div>
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
