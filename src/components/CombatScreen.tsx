import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate, useAnimate } from 'framer-motion'
import { Shield, Heart, Swords } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import type { Die, TurnPhase } from '../store/gameStore'

// ── Rarity styles ────────────────────────────────────────────────────────────
const rarityStyle: Record<Die['rarity'], { bg: string; shadow: string; text: string }> = {
  common:    { bg: '#d4d4d4', shadow: '#555555', text: '#1a1a2e' },
  uncommon:  { bg: '#4ade80', shadow: '#15803d', text: '#052e16' },
  rare:      { bg: '#3b82f6', shadow: '#1e3a8a', text: '#ffffff' },
  legendary: { bg: '#fbbf24', shadow: '#78350f', text: '#1a1a2e' },
}

// ── Label ────────────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: '0.65rem',
      color: '#9ca3af',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.25em',
      textShadow: '1px 1px 0 #000, -1px 0 0 #000',
      background: 'rgba(0,0,0,0.45)',
      padding: '2px 6px',
    }}>
      {children}
    </span>
  )
}

// ── Die card ─────────────────────────────────────────────────────────────────
function DieCard({ die }: { die: Die }) {
  const s = rarityStyle[die.rarity]
  return (
    <motion.div
      key={`${die.id}-${die.currentValue}`}
      initial={{ scale: 0.5, rotate: -20, opacity: 0.6 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      className="pixel-die"
      style={{ background: s.bg, color: s.text, boxShadow: `4px 4px 0 ${s.shadow}` }}
    >
      {die.currentValue ?? '?'}
    </motion.div>
  )
}

// ── HP bar ───────────────────────────────────────────────────────────────────
function HpBar({ hp, maxHp, color }: { hp: number; maxHp: number; color: string }) {
  const pct = Math.max(0, (hp / maxHp) * 100)
  return (
    <div className="pixel-bar-track" style={{ flex: 1 }}>
      <motion.div
        className="pixel-bar-fill"
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ background: color }}
      />
    </div>
  )
}

// ── Damage counter ───────────────────────────────────────────────────────────
function DamageCounter({ target }: { target: number }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => {
    count.set(0)
    if (target === 0) return
    const controls = animate(count, target, { duration: 0.75, ease: 'easeOut' })
    return controls.stop
  }, [target])

  return (
    <motion.span style={{
      fontSize: '5rem',
      fontWeight: 700,
      color: '#fbbf24',
      lineHeight: 1,
      textShadow: '3px 3px 0 #78350f',
      fontVariantNumeric: 'tabular-nums',
    }}>
      {rounded}
    </motion.span>
  )
}

// ── Phase label for the button area ─────────────────────────────────────────
const phaseText: Record<TurnPhase, string> = {
  idle:          '▶ ROLL DICE',
  rolling:       '⟳  ROLLING...',
  player_attack: '⚔  ATTACKING!',
  enemy_attack:  '☠  ENEMY TURN...',
}

// ── Hook: shake + flash a zone when hitVersion increments ────────────────────
function useHitAnimation(hitVersion: number, flashColor: string) {
  const [scope, animateEl] = useAnimate()
  const prevVersion = useRef(hitVersion)

  useEffect(() => {
    if (hitVersion === prevVersion.current) return
    prevVersion.current = hitVersion
    animateEl(scope.current, {
      x: [0, -10, 10, -7, 7, -4, 0],
      backgroundColor: [flashColor, 'transparent'],
    }, { duration: 0.45, ease: 'easeOut' })
  }, [hitVersion])

  return scope
}

// ── Main screen ──────────────────────────────────────────────────────────────
export function CombatScreen() {
  const {
    player, enemy, dicePool,
    totalDamage, turnPhase,
    enemyHitVersion, playerHitVersion,
    currentFloor, executeTurn,
  } = useGameStore()

  const enemyScope  = useHitAnimation(enemyHitVersion,  'rgba(220,38,38,0.45)')
  const playerScope = useHitAnimation(playerHitVersion, 'rgba(220,38,38,0.45)')

  const isIdle = turnPhase === 'idle'

  return (
    <div style={{
      maxWidth: 384, margin: '0 auto', height: '100dvh',
      display: 'flex', flexDirection: 'column',
      background: '#0f0f1a', color: '#fff', overflow: 'hidden',
    }}>

      {/* Zone A — Enemy */}
      <div
        ref={enemyScope}
        style={{
          background: '#1a1a2e', padding: '12px 16px',
          borderBottom: '3px solid #000',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Label>Floor {currentFloor}</Label>
          <Label>Enemy</Label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f87171', textShadow: '2px 2px 0 #000' }}>
            {enemy.name}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#d1d5db' }}>{enemy.hp} / {enemy.maxHp}</span>
        </div>
        <HpBar hp={enemy.hp} maxHp={enemy.maxHp} color="#ef4444" />
      </div>

      {/* Zone B — Player / Total Damage */}
      <div
        ref={playerScope}
        style={{
          background: '#0f0f1a', padding: '16px',
          borderBottom: '3px solid #000',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Heart size={14} color="#f472b6" />
          <span style={{ color: '#f9a8d4', fontWeight: 600 }}>{player.hp}</span>
          <span style={{ color: '#4b5563' }}>/ {player.maxHp}</span>
          {player.shield > 0 && (
            <>
              <Shield size={14} color="#38bdf8" />
              <span style={{ color: '#7dd3fc', fontWeight: 600 }}>{player.shield}</span>
            </>
          )}
          <div style={{ marginLeft: 'auto', width: 96 }}>
            <HpBar hp={player.hp} maxHp={player.maxHp} color="#ec4899" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Swords size={12} color="#6b7280" />
            <Label>Total Damage</Label>
          </div>
          <DamageCounter target={totalDamage} />
        </div>
      </div>

      {/* Zone C — Dice Tray */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 12, padding: '16px', background: '#12121f',
      }}>
        <Label>Dice Hand</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          {dicePool.map((die) => (
            <DieCard key={die.id} die={die} />
          ))}
        </div>
      </div>

      {/* Zone D — Actions */}
      <div style={{ background: '#1a1a2e', padding: '16px', borderTop: '3px solid #000' }}>
        <button
          onClick={executeTurn}
          disabled={!isIdle}
          className="pixel-btn"
          style={{
            background: isIdle ? '#4f46e5' : '#374151',
            opacity: isIdle ? 1 : 0.75,
            cursor: isIdle ? 'pointer' : 'not-allowed',
          }}
        >
          {phaseText[turnPhase]}
        </button>
      </div>

    </div>
  )
}
