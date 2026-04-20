import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useAnimate } from 'framer-motion'
import { Shield, Heart, Swords } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import type { TurnPhase, Die } from '../store/gameStore'
import { DieCard, faceColor, faceShadow } from './DieCard'

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
function DamageCounter({ target, orbVersion, counterVersion }: {
  target: number; orbVersion: number; counterVersion: number
}) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => { count.set(0) }, [orbVersion])
  useEffect(() => {
    if (counterVersion === 0) return
    const controls = animate(count, target, { duration: 0.75, ease: 'easeOut' })
    return controls.stop
  }, [counterVersion])

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

// ── Secondary counter (heal / shield) ───────────────────────────────────────
function SecondaryCounter({
  target, color, icon, orbVersion, counterVersion,
}: {
  target: number; color: string; icon: React.ReactNode
  orbVersion: number; counterVersion: number
}) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => { count.set(0) }, [orbVersion])
  useEffect(() => {
    if (counterVersion === 0 || target === 0) return
    const controls = animate(count, target, { duration: 0.75, ease: 'easeOut' })
    return controls.stop
  }, [counterVersion])

  if (target === 0) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {icon}
      <motion.span style={{
        fontSize: '1.4rem',
        fontWeight: 700,
        color,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {rounded}
      </motion.span>
    </div>
  )
}

// ── Flying orbs ──────────────────────────────────────────────────────────────
type Orb = { id: number; color: string; shadow: string; sx: number; sy: number; ex: number; ey: number }

function OrbLayer({ equippedDice, orbVersion, damageRef, healRef, shieldRef }: {
  equippedDice: Die[]
  orbVersion: number
  damageRef: React.RefObject<HTMLDivElement | null>
  healRef: React.RefObject<HTMLDivElement | null>
  shieldRef: React.RefObject<HTMLDivElement | null>
}) {
  const [orbs, setOrbs] = useState<Orb[]>([])
  const prevVersion = useRef(orbVersion)

  useEffect(() => {
    if (orbVersion === prevVersion.current) return
    prevVersion.current = orbVersion

    const next: Orb[] = []
    equippedDice.forEach((die, i) => {
      if (!die.currentFace) return
      const dieEl = document.querySelector(`[data-die-id="${die.id}"]`)
      if (!dieEl) return
      const dr = dieEl.getBoundingClientRect()
      const targetRef = die.currentFace.type === 'damage' ? damageRef
                      : die.currentFace.type === 'heal'   ? healRef
                      : shieldRef
      const tr = targetRef.current?.getBoundingClientRect()
      if (!tr) return
      next.push({
        id: Date.now() + i,
        color: faceColor[die.currentFace.type],
        shadow: faceShadow[die.currentFace.type],
        sx: dr.left + dr.width  / 2,
        sy: dr.top  + dr.height / 2,
        ex: tr.left + tr.width  / 2,
        ey: tr.top  + tr.height / 2,
      })
    })

    if (!next.length) return
    setOrbs(next)
    setTimeout(() => setOrbs([]), 600)
  }, [orbVersion])

  const S = 10
  return (
    <AnimatePresence>
      {orbs.map((o) => (
        <motion.div
          key={o.id}
          style={{
            position: 'fixed',
            width: S, height: S,
            background: o.color,
            border: '2px solid #000',
            boxShadow: `2px 2px 0 ${o.shadow}`,
            pointerEvents: 'none',
          }}
          initial={{ left: o.sx - S / 2, top: o.sy - S / 2, scale: 1 }}
          animate={{ left: o.ex - S / 2, top: o.ey - S / 2, scale: 0.5 }}
          transition={{ duration: 0.42, ease: 'easeIn' }}
        />
      ))}
    </AnimatePresence>
  )
}

// ── Floating effect popups ───────────────────────────────────────────────────
// Each entry mounts as a motion.div that floats up and fades out over ~1s,
// then gets removed from state via setTimeout after the animation finishes.

type FloatItem = { id: number; label: string; color: string; shadow: string; offset: number }

function FloatingEffects({
  heal, shield, version,
}: {
  heal: number
  shield: number
  version: number
}) {
  const [items, setItems] = useState<FloatItem[]>([])
  const prevVersion = useRef(version)

  useEffect(() => {
    if (version === prevVersion.current) return
    prevVersion.current = version

    const now = Date.now()
    const next: FloatItem[] = []
    if (heal > 0)   next.push({ id: now,     label: `♥ +${heal}`,     color: '#4ade80', shadow: '#15803d', offset: -24 })
    if (shield > 0) next.push({ id: now + 1, label: `⬡ +${shield}`,   color: '#38bdf8', shadow: '#1e3a8a', offset:  24 })
    if (!next.length) return

    setItems((prev) => [...prev, ...next])
    // clean up after animation duration (1.1s)
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => !next.find((n) => n.id === i.id)))
    }, 1150)
  }, [version, heal, shield])

  return (
    <AnimatePresence>
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -44 }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: `calc(50% + ${item.offset}px)`,
            top: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            color: item.color,
            fontWeight: 700,
            fontSize: '1.15rem',
            textShadow: `2px 2px 0 ${item.shadow}`,
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          {item.label}
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

// ── Phase labels ─────────────────────────────────────────────────────────────
const phaseText: Record<Exclude<TurnPhase, 'loadout'>, string> = {
  idle:          '▶ ROLL DICE',
  rolling:       '⟳  ROLLING...',
  player_attack: '⚔  ATTACKING!',
  enemy_attack:  '☠  ENEMY TURN...',
}

// ── Hit animation hook ────────────────────────────────────────────────────────
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
    player, enemy, equippedDice,
    totalDamage, lastEffects, turnPhase,
    enemyHitVersion, playerHitVersion, playerEffectVersion,
    orbVersion, counterVersion,
    currentFloor, executeTurn,
  } = useGameStore()

  const enemyScope  = useHitAnimation(enemyHitVersion,  'rgba(220,38,38,0.45)')
  const playerScope = useHitAnimation(playerHitVersion, 'rgba(220,38,38,0.45)')

  const damageRef = useRef<HTMLDivElement>(null)
  const healRef   = useRef<HTMLDivElement>(null)
  const shieldRef = useRef<HTMLDivElement>(null)

  const isIdle = turnPhase === 'idle'
  const phase  = turnPhase as Exclude<TurnPhase, 'loadout'>

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
          position: 'relative',           // anchor for floating effects
          background: '#0f0f1a', padding: '16px',
          borderBottom: '3px solid #000',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}
      >
        {/* Floating heal / shield popups */}
        <FloatingEffects
          heal={lastEffects.heal}
          shield={lastEffects.shield}
          version={playerEffectVersion}
        />

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
          <div ref={damageRef}>
            <DamageCounter target={totalDamage} orbVersion={orbVersion} counterVersion={counterVersion} />
          </div>

          {/* Secondary results — count up when orbs land */}
          {(lastEffects.heal > 0 || lastEffects.shield > 0) && (
            <div style={{
              display: 'flex', gap: 20, marginTop: 8,
              borderTop: '2px solid #1e1e2e', paddingTop: 8,
            }}>
              <div ref={healRef}>
                <SecondaryCounter
                  target={lastEffects.heal}
                  color="#4ade80"
                  icon={<Heart size={14} color="#4ade80" strokeWidth={2.5} />}
                  orbVersion={orbVersion}
                  counterVersion={counterVersion}
                />
              </div>
              <div ref={shieldRef}>
                <SecondaryCounter
                  target={lastEffects.shield}
                  color="#38bdf8"
                  icon={<Shield size={14} color="#38bdf8" strokeWidth={2.5} />}
                  orbVersion={orbVersion}
                  counterVersion={counterVersion}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Orb overlay — fixed, spans full viewport */}
      <OrbLayer
        equippedDice={equippedDice}
        orbVersion={orbVersion}
        damageRef={damageRef}
        healRef={healRef}
        shieldRef={shieldRef}
      />

      {/* Zone C — Dice Tray */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 12, padding: '16px', background: '#12121f',
      }}>
        <Label>Dice Hand</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          {equippedDice.map((die) => (
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
          {phaseText[phase]}
        </button>
      </div>
    </div>
  )
}
