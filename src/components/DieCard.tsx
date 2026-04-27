import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Shield, Heart, Skull, Coins, Droplets, Star, Shuffle } from 'lucide-react'
import type { Die, DieType, DieFace, ResolvingPhase } from '../store/gameStore'

// ── Visual tables ────────────────────────────────────────────────────────────

export const dieTypeStyle: Record<DieType, { bg: string; shadow: string; text: string }> = {
  white:     { bg: '#e2e2e2', shadow: '#666666', text: '#1a1a2e' },
  blue:      { bg: '#3b82f6', shadow: '#1e3a8a', text: '#ffffff' },
  green:     { bg: '#4ade80', shadow: '#15803d', text: '#052e16' },
  cursed:    { bg: '#581c87', shadow: '#3b0764', text: '#f5d0fe' },
  heavy:     { bg: '#fecaca', shadow: '#991b1b', text: '#7f1d1d' },
  paladin:   { bg: '#fef3c7', shadow: '#92400e', text: '#78350f' },
  gambler:   { bg: '#e9d5ff', shadow: '#6d28d9', text: '#4c1d95' },
  scavenger: { bg: '#fed7aa', shadow: '#c2410c', text: '#7c2d12' },
  wall:      { bg: '#bfdbfe', shadow: '#1d4ed8', text: '#1e3a8a' },
  jackpot:       { bg: '#fbbf24', shadow: '#78350f',  text: '#1c0a00' },
  vampire:       { bg: '#7f1d1d', shadow: '#450a0a',  text: '#fca5a5' },
  priest:        { bg: '#fef9c3', shadow: '#a16207',  text: '#713f12' },
  fortune_teller:{ bg: '#6366f1', shadow: '#1e1b4b',  text: '#e0e7ff' },
  joker:         { bg: '#d1d5db', shadow: '#6b7280',  text: '#111827' },
}

// Custom loot dice use their die text color for all face content (monochrome)
const CUSTOM_LOOT_DIES = new Set<DieType>(['heavy', 'paladin', 'gambler', 'scavenger', 'wall', 'jackpot', 'vampire', 'priest', 'fortune_teller', 'joker'])

export const faceColor: Record<DieFace['type'], string> = {
  damage:         '#dc2626',
  shield:         '#38bdf8',
  heal:           '#22c55e',
  skull:          '#7c3aed',
  gold:           '#fbbf24',
  lifesteal:      '#e879f9',
  choose_next:    '#a5b4fc',
  wildcard:       '#a8a29e',
  blank:          '#374151',
  purified_skull: '#ffffff',
}

export const faceShadow: Record<DieFace['type'], string> = {
  damage:         '#7f1d1d',
  shield:         '#1e3a8a',
  heal:           '#15803d',
  skull:          '#3b0764',
  gold:           '#78350f',
  lifesteal:      '#701a75',
  choose_next:    '#3730a3',
  wildcard:       '#57534e',
  blank:          '#1f2937',
  purified_skull: '#9f1239',
}

// ── Type icon ────────────────────────────────────────────────────────────────

function TypeIcon({ type, size = 13, forceColor }: { type: DieFace['type']; size?: number; forceColor?: string }) {
  const color = forceColor ?? faceColor[type]
  if (type === 'damage')      return <Swords   size={size} color={color} strokeWidth={2.5} />
  if (type === 'shield')      return <Shield   size={size} color={color} strokeWidth={2.5} />
  if (type === 'skull')       return <Skull    size={size} color={color} strokeWidth={2.5} />
  if (type === 'gold')        return <Coins    size={size} color={color} strokeWidth={2.5} />
  if (type === 'lifesteal')   return <Droplets size={size} color={color} strokeWidth={2.5} />
  if (type === 'choose_next') return <Star     size={size} color={color} strokeWidth={2.5} />
  if (type === 'wildcard')    return <Shuffle  size={size} color={color} strokeWidth={2.5} />
  return                             <Heart    size={size} color={color} strokeWidth={2.5} />
}

// ── DiceFace ─────────────────────────────────────────────────────────────────

function DiceFace({ face, textColor, dieType }: { face: DieFace; textColor: string; dieType: DieType }) {
  // Custom loot dice use their die text color for all icons (monochrome palette)
  const iconColor = CUSTOM_LOOT_DIES.has(dieType) ? textColor : undefined

  // Blank — completely empty face
  if (face.type === 'blank') {
    return <div style={{ width: '100%', height: '100%' }} />
  }

  // Purified skull — white skull with red X overlay
  if (face.type === 'purified_skull') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', position: 'relative' }}>
        <Skull size={32} color="#ffffff" strokeWidth={2.5} />
        <svg
          style={{ position: 'absolute', pointerEvents: 'none', zIndex: 10 }}
          width="36" height="36" viewBox="0 0 36 36"
        >
          <line x1="3" y1="3" x2="33" y2="33" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
          <line x1="33" y1="3" x2="3" y2="33" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  // Skull, choose_next, and wildcard render icon-only
  if (face.type === 'skull' || face.type === 'choose_next' || face.type === 'wildcard') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <TypeIcon type={face.type} size={32} forceColor={iconColor} />
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
      <TypeIcon type={face.type} size={16} forceColor={iconColor} />
    </div>
  )
}

// ── Particle burst ────────────────────────────────────────────────────────────

function ParticleBurst({ faceType }: { faceType: DieFace['type'] }) {
  const count    = 7
  const baseSize = 4
  const color    = faceColor[faceType]
  const shadow   = faceShadow[faceType]
  const baseDist = 28
  const dur      = 0.38

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
              pointerEvents: 'none', zIndex: 30,
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

// ── Heavy: violent red impact flash ──────────────────────────────────────────

function HeavyImpactFlash() {
  return (
    <motion.div
      style={{
        position: 'absolute', inset: -4,
        border: '3px solid #dc2626',
        pointerEvents: 'none', zIndex: 20,
      }}
      initial={{ boxShadow: '0 0 30px 10px #dc2626', opacity: 1 }}
      animate={{ boxShadow: '0 0 0px 0px #dc2626',   opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    />
  )
}

// ── Paladin: golden aura pulse + floating holy-light particles ───────────────

const PALADIN_PARTICLES = [
  { x: -14, delay: 0    },
  { x:   6, delay: 0.45 },
  { x:  -4, delay: 0.9  },
  { x:  15, delay: 1.35 },
]

function PaladinAura() {
  return (
    <>
      <motion.div
        style={{
          position: 'absolute', inset: -3,
          pointerEvents: 'none', zIndex: 0,
          boxShadow: '0 0 0px 0px rgba(251,191,36,0)',
        }}
        animate={{
          boxShadow: [
            '0 0 0px 0px rgba(251,191,36,0)',
            '0 0 16px 5px rgba(251,191,36,0.75)',
            '0 0 0px 0px rgba(251,191,36,0)',
          ],
        }}
        transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
      />
      {PALADIN_PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 3, height: 3,
            background: '#fbbf24',
            left: `calc(50% + ${p.x}px)`,
            bottom: 8,
            pointerEvents: 'none', zIndex: 40,
          }}
          animate={{ y: [0, -28], opacity: [0, 0.9, 0] }}
          transition={{ duration: 1.4, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}

// ── Gambler: jackpot colour-cycling border ────────────────────────────────────

function GamblerJackpot() {
  return (
    <motion.div
      style={{
        position: 'absolute', inset: -3,
        border: '3px solid #fbbf24',
        pointerEvents: 'none', zIndex: 20,
      }}
      animate={{
        borderColor:  ['#fbbf24', '#ffffff', '#7c3aed', '#fbbf24'],
        boxShadow:    [
          '0 0 8px 2px #fbbf24',
          '0 0 14px 4px #ffffff',
          '0 0 10px 2px #7c3aed',
          '0 0 8px 2px #fbbf24',
        ],
      }}
      transition={{ duration: 0.28, repeat: Infinity, ease: 'linear' }}
    />
  )
}

// ── Scavenger: snappy slide-in from the left + orange impact flash ────────────

function ScavengerFlash() {
  return (
    <motion.div
      style={{
        position: 'absolute', inset: -4,
        border: '3px solid #ea580c',
        pointerEvents: 'none', zIndex: 20,
      }}
      initial={{ boxShadow: '0 0 22px 8px #ea580c', opacity: 1 }}
      animate={{ boxShadow: '0 0 0px 0px #ea580c',  opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    />
  )
}

// ── Wall: heavy drop + solid blue shield-impact flash ────────────────────────

function WallImpactFlash() {
  return (
    <motion.div
      style={{
        position: 'absolute', inset: -4,
        border: '3px solid #1e40af',
        pointerEvents: 'none', zIndex: 20,
      }}
      initial={{ boxShadow: '0 0 28px 10px #1e40af', opacity: 1 }}
      animate={{ boxShadow: '0 0 0px 0px #1e40af',   opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
  )
}

// ── Priest: holy beam + rising gold particles ─────────────────────────────────

const PRIEST_PARTICLES = [
  { left: '22%', delay: 0    },
  { left: '45%', delay: 0.07 },
  { left: '68%', delay: 0.14 },
  { left: '35%', delay: 0.04 },
]

function PriestBeam() {
  return (
    <>
      <motion.div
        style={{
          position: 'absolute', left: '50%', top: -18,
          width: 22, height: 'calc(100% + 36px)', marginLeft: -11,
          background: 'rgba(251,191,36,0.32)',
          pointerEvents: 'none', zIndex: 20,
        }}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: [0, 1, 0], scaleX: [0, 1, 0] }}
        transition={{ duration: 0.48, ease: 'easeOut' }}
      />
      {PRIEST_PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute', width: 4, height: 4,
            background: '#fbbf24', border: '1px solid #92400e',
            left: p.left, top: '45%',
            pointerEvents: 'none', zIndex: 40,
          }}
          initial={{ y: 0, opacity: 1, scale: 1 }}
          animate={{ y: -36, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.6, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
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
  const s          = dieTypeStyle[die.dieType]
  const face       = die.currentFace
  const mergeLevel = die.mergeLevel ?? 0

  const isSpinning = isResolving && resolvingPhase === 'spinning'
  const isLanded   = isResolving && resolvingPhase === 'landed'

  // Cycle through faces while spinning
  const [spinFace, setSpinFace] = useState<DieFace | null>(null)
  useEffect(() => {
    if (!isSpinning) { setSpinFace(null); return }
    const id = setInterval(() => {
      setSpinFace(die.faces[Math.floor(Math.random() * die.faces.length)])
    }, 75)
    return () => clearInterval(id)
  }, [isSpinning])

  // One-shot burst on impact
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

  // ── Per-die outer animation (spin state) ────────────────────────────────────
  let outerSpinAnimate: Record<string, unknown>
  let outerSpinTransition: Record<string, unknown>

  if (die.dieType === 'heavy') {
    outerSpinAnimate   = { y: -70, scale: 2, rotate: -15, filter: 'blur(1px)' }
    outerSpinTransition = {
      y:      { duration: 0.18, ease: 'easeOut' },
      scale:  { duration: 0.18 },
      rotate: { duration: 0.18 },
      filter: { duration: 0.1 },
    }
  } else if (die.dieType === 'paladin' || die.dieType === 'priest') {
    outerSpinAnimate   = { y: -40, opacity: 0.1, filter: 'blur(0.5px)', scale: 1 }
    outerSpinTransition = {
      y:       { duration: 0.25, ease: 'easeOut' },
      opacity: { duration: 0.2 },
      filter:  { duration: 0.15 },
    }
  } else if (die.dieType === 'gambler') {
    outerSpinAnimate   = { y: -50, filter: 'blur(2px)', rotateY: 360, scale: 1 }
    outerSpinTransition = {
      y:       { duration: 0.2, ease: 'easeOut' },
      filter:  { duration: 0.15 },
      rotateY: { duration: 0.1, repeat: Infinity, ease: 'linear' },
      scale:   { duration: 0.1 },
    }
  } else if (die.dieType === 'scavenger') {
    outerSpinAnimate   = { x: -100, rotateZ: -90, opacity: 0, filter: 'blur(1px)', scale: 1 }
    outerSpinTransition = {
      x:       { duration: 0.18, ease: 'easeOut' },
      rotateZ: { duration: 0.18 },
      opacity: { duration: 0.12 },
      filter:  { duration: 0.1 },
    }
  } else if (die.dieType === 'wall') {
    outerSpinAnimate   = { y: -50, scale: 1.2, filter: 'blur(1px)' }
    outerSpinTransition = {
      y:      { duration: 0.16, ease: 'easeOut' },
      scale:  { duration: 0.16 },
      filter: { duration: 0.1 },
    }
  } else {
    outerSpinAnimate   = { y: -28, filter: 'blur(2.5px)', rotateY: 360, scale: 1 }
    outerSpinTransition = {
      y:       { duration: 0.22, ease: 'easeOut' },
      filter:  { duration: 0.15 },
      rotateY: { duration: 0.22, repeat: Infinity, ease: 'linear' },
      scale:   { duration: 0.12 },
    }
  }

  // ── Per-die outer animation (land state) ────────────────────────────────────
  let outerLandAnimate: Record<string, unknown>
  let outerLandTransition: Record<string, unknown>

  if (die.dieType === 'heavy') {
    outerLandAnimate   = { y: 0, scale: 1, rotate: 0, filter: 'blur(0px)' }
    outerLandTransition = {
      y:      { type: 'spring', stiffness: 400, damping: 10 },
      scale:  { type: 'spring', stiffness: 400, damping: 10 },
      rotate: { type: 'spring', stiffness: 400, damping: 10 },
      filter: { duration: 0.08 },
    }
  } else if (die.dieType === 'paladin' || die.dieType === 'priest') {
    outerLandAnimate   = { y: 0, opacity: 1, filter: 'blur(0px)', scale: 1 }
    outerLandTransition = {
      y:       { type: 'spring', stiffness: 100, damping: 15 },
      opacity: { duration: 0.35 },
      filter:  { duration: 0.2 },
      scale:   { duration: 0.2 },
    }
  } else if (die.dieType === 'gambler') {
    outerLandAnimate   = { y: 0, rotateY: 0, filter: 'blur(0px)', scale: [0.78, 1.18, 1] as number[] }
    outerLandTransition = {
      y:       { type: 'spring', stiffness: 300, damping: 15 },
      rotateY: { type: 'spring', stiffness: 300, damping: 15 },
      scale:   { duration: 0.32, ease: [0.15, 0, 0.1, 1.9] },
      filter:  { duration: 0.08 },
    }
  } else if (die.dieType === 'scavenger') {
    outerLandAnimate   = { x: 0, rotateZ: 0, opacity: 1, filter: 'blur(0px)', scale: 1 }
    outerLandTransition = {
      x:       { type: 'spring', stiffness: 500, damping: 30 },
      rotateZ: { type: 'spring', stiffness: 500, damping: 30 },
      opacity: { duration: 0.15 },
      filter:  { duration: 0.08 },
    }
  } else if (die.dieType === 'wall') {
    outerLandAnimate   = { y: 0, scale: 1, filter: 'blur(0px)' }
    outerLandTransition = {
      y:      { type: 'spring', stiffness: 500, damping: 40 },
      scale:  { type: 'spring', stiffness: 500, damping: 40 },
      filter: { duration: 0.08 },
    }
  } else {
    outerLandAnimate   = { y: 0, filter: 'blur(0px)', rotateY: 0, scale: [0.78, 1.18, 1] as number[] }
    outerLandTransition = {
      y:       { type: 'spring', stiffness: 900, damping: 22 },
      scale:   { duration: 0.32, ease: [0.15, 0, 0.1, 1.9] },
      filter:  { duration: 0.08 },
      rotateY: { duration: 0.12 },
    }
  }

  // Idle — restore any props animated during spin (opacity, x, rotateZ)
  let outerIdleAnimate: Record<string, unknown>
  if (die.dieType === 'paladin' || die.dieType === 'priest') {
    outerIdleAnimate = { y: 0, filter: 'blur(0px)', rotateY: 0, scale: 1, opacity: 1 }
  } else if (die.dieType === 'scavenger') {
    outerIdleAnimate = { x: 0, rotateZ: 0, opacity: 1, filter: 'blur(0px)', scale: 1 }
  } else {
    outerIdleAnimate = { y: 0, filter: 'blur(0px)', rotateY: 0, scale: 1 }
  }

  const outerAnimate    = isSpinning ? outerSpinAnimate    : isLanded ? outerLandAnimate    : outerIdleAnimate
  const outerTransition = isSpinning ? outerSpinTransition : isLanded ? outerLandTransition : { duration: 0.22 }

  // ── Per-die inner die body init/transition ──────────────────────────────────
  let innerInitial: Record<string, unknown>
  let innerTransition: Record<string, unknown>

  if (!isLanded) {
    innerInitial    = { scale: 0.6, rotate: -15, opacity: 0.5 }
    innerTransition = { type: 'spring', stiffness: 500, damping: 18 }
  } else if (die.dieType === 'heavy') {
    innerInitial    = { scale: 0.2, rotate: -22, opacity: 0.6 }
    innerTransition = { type: 'spring', stiffness: 500, damping: 8, mass: 0.6 }
  } else if (die.dieType === 'paladin') {
    innerInitial    = { scale: 0.9, rotate: 0, opacity: 0 }
    innerTransition = { type: 'spring', stiffness: 80, damping: 12 }
  } else if (die.dieType === 'gambler') {
    innerInitial    = { scale: 0.4, rotate: 18, opacity: 0.6 }
    innerTransition = { type: 'spring', stiffness: 350, damping: 10, mass: 0.7 }
  } else if (die.dieType === 'scavenger') {
    innerInitial    = { scale: 0.7, rotate: 12, opacity: 0.5 }
    innerTransition = { type: 'spring', stiffness: 500, damping: 22 }
  } else if (die.dieType === 'wall') {
    innerInitial    = { scale: 0.55, rotate: 0, opacity: 0.8 }
    innerTransition = { type: 'spring', stiffness: 500, damping: 40 }
  } else {
    innerInitial    = { scale: 0.35, rotate: -6, opacity: 0.7 }
    innerTransition = { type: 'spring', stiffness: 360, damping: 9, mass: 0.55 }
  }

  const displayFace = isSpinning ? spinFace : face

  // Continuous effects only visible once the face is revealed
  const showPersistentEffects = !!face && !isSpinning

  // ── Idle loop wrapper (Paladin float, Gambler jitter) ───────────────────────
  const showIdleLoop = !!face && !isSpinning
  let idleLoopAnimate: Record<string, unknown>
  let idleLoopTransition: Record<string, unknown>

  if (showIdleLoop && die.dieType === 'paladin') {
    idleLoopAnimate    = { y: [0, -4, 0] }
    idleLoopTransition = { repeat: Infinity, duration: 2, ease: 'easeInOut' }
  } else if (showIdleLoop && die.dieType === 'gambler') {
    idleLoopAnimate    = { x: [0, -2, 2, -2, 2, 0] }
    idleLoopTransition = { repeat: Infinity, duration: 0.4, repeatDelay: 2.5 }
  } else {
    idleLoopAnimate    = { y: 0, x: 0 }
    idleLoopTransition = { duration: 0.2 }
  }

  return (
    <motion.div
      style={{ display: 'inline-block', position: 'relative' }}
      animate={idleLoopAnimate as never}
      transition={idleLoopTransition as never}
    >
    <motion.div
      data-die-id={die.id}
      style={{ display: 'inline-block', position: 'relative', transformPerspective: 600 }}
      animate={outerAnimate as never}
      transition={outerTransition as never}
    >
      <motion.div
        key={`${die.id}-${face?.type ?? 'none'}-${face?.value ?? 0}`}
        initial={innerInitial as never}
        animate={{ scale: 1, rotate: 0, opacity: dimmed ? 0.45 : 1 }}
        transition={innerTransition as never}
        className="pixel-die"
        onClick={onClick}
        style={{
          position: 'relative',
          background: s.bg,
          boxShadow: mergeLevel >= 3
            ? `4px 4px 0 ${s.shadow}, 0 0 25px rgba(220,38,38,0.9)`
            : mergeLevel === 2
              ? `4px 4px 0 ${s.shadow}, 0 0 16px rgba(249,115,22,0.8)`
              : mergeLevel === 1
                ? `4px 4px 0 ${s.shadow}, 0 0 12px rgba(34,211,238,0.7)`
                : `4px 4px 0 ${s.shadow}`,
          border: mergeLevel >= 3
            ? '4px solid #dc2626'
            : mergeLevel === 2
              ? '3px solid #f97316'
              : mergeLevel === 1
                ? '2px solid #22d3ee'
                : undefined,
          cursor: onClick ? 'pointer' : 'default',
          flexDirection: 'column',
        }}
      >
        {displayFace
          ? <DiceFace face={displayFace} textColor={s.text} dieType={die.dieType} />
          : <span style={{ fontSize: '1.5rem', fontWeight: 700, color: s.text }}>?</span>
        }

        {/* Merge level badge */}
        {mergeLevel > 0 && (
          <div style={{
            position: 'absolute', top: 3, left: 3,
            background: 'rgba(0,0,0,0.82)',
            color: '#fff',
            fontSize: '0.55rem', fontWeight: 900,
            lineHeight: 1, padding: '2px 4px',
            pointerEvents: 'none', zIndex: 10,
          }}>
            +{mergeLevel}
          </div>
        )}

        {/* Purple pulse — Cursed dice only */}
        {die.dieType === 'cursed' && face?.type === 'skull' && !isSpinning && (
          <motion.div
            style={{
              position: 'absolute', inset: -3,
              border: '3px solid #7c3aed',
              pointerEvents: 'none', zIndex: 1,
            }}
            animate={{
              opacity: [0.35, 1, 0.35],
              boxShadow: [
                '0 0 6px 2px rgba(124,58,237,0.25)',
                '0 0 18px 7px rgba(124,58,237,0.75)',
                '0 0 6px 2px rgba(124,58,237,0.25)',
              ],
            }}
            transition={{ duration: 2.0, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Merge level 3+ — pulsing red aura overlay */}
        {mergeLevel >= 3 && (
          <motion.div
            style={{
              position: 'absolute', inset: -3,
              border: '3px solid #dc2626',
              pointerEvents: 'none', zIndex: 1,
            }}
            animate={{
              opacity: [1, 0.3, 1],
              boxShadow: [
                '0 0 12px 4px rgba(220,38,38,0.5)',
                '0 0 30px 10px rgba(220,38,38,0.95)',
                '0 0 12px 4px rgba(220,38,38,0.5)',
              ],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Impact particle burst — all dice */}
        {burst && face && <ParticleBurst faceType={face.type} />}

        {/* Heavy — violent red flash on impact */}
        <AnimatePresence>
          {die.dieType === 'heavy' && burst && <HeavyImpactFlash key="heavy-flash" />}
        </AnimatePresence>

        {/* Paladin — continuous golden aura + holy particles */}
        {die.dieType === 'paladin' && showPersistentEffects && <PaladinAura />}

        {/* Gambler — jackpot border flash when 8 is rolled */}
        {die.dieType === 'gambler' && showPersistentEffects && face?.value === 8 && <GamblerJackpot />}

        {/* Scavenger — orange impact flash */}
        <AnimatePresence>
          {die.dieType === 'scavenger' && burst && <ScavengerFlash key="scavenger-flash" />}
        </AnimatePresence>

        {/* Wall — blue shield-impact flash */}
        <AnimatePresence>
          {die.dieType === 'wall' && burst && <WallImpactFlash key="wall-flash" />}
        </AnimatePresence>

        {/* Priest — holy beam + rising particles on heal */}
        <AnimatePresence>
          {die.dieType === 'priest' && burst && face?.type === 'heal' && (
            <PriestBeam key="priest-beam" />
          )}
        </AnimatePresence>
      </motion.div>
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
