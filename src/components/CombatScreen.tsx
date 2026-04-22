import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useAnimate } from 'framer-motion'
import { Shield, Heart, Swords, Library, Skull, Coins } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import type { Die, EnemyIntent, ResolvingPhase, DieType } from '../store/gameStore'
import { DieCard, faceColor, faceShadow } from './DieCard'
import { EnemySprite } from './EnemySprite'
import { DiceInspectorModal } from './DiceInspectorModal'

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
    <div className="pixel-bar-track" style={{ width: '100%' }}>
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
function DamageCounter({ target, rollStartVersion, counterVersion }: {
  target: number; rollStartVersion: number; counterVersion: number
}) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => { count.set(0) }, [rollStartVersion])
  useEffect(() => {
    if (counterVersion === 0) return
    const controls = animate(count, target, { duration: 0.15, ease: 'easeOut' })
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

// ── Stat badge (heal / shield / gold secondary counter) ──────────────────────
function StatBadge({
  target, color, shadow, icon, rollStartVersion, counterVersion,
}: {
  target: number; color: string; shadow: string; icon: React.ReactNode
  rollStartVersion: number; counterVersion: number
}) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => { count.set(0) }, [rollStartVersion])
  useEffect(() => {
    if (counterVersion === 0 || target === 0) return
    const controls = animate(count, target, { duration: 0.15, ease: 'easeOut' })
    return controls.stop
  }, [counterVersion])

  if (target === 0) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      background: '#0a0a14',
      border: `2px solid ${shadow}`,
      boxShadow: `2px 2px 0 ${shadow}`,
      padding: '4px 10px',
    }}>
      {icon}
      <motion.span style={{
        fontSize: '1rem',
        fontWeight: 700,
        color,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {rounded}
      </motion.span>
    </div>
  )
}

// ── Skull tracker ─────────────────────────────────────────────────────────────
function SkullTracker({ skullCount }: { skullCount: number }) {
  const isDanger = skullCount >= 2
  const icons = (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <Skull
          key={i}
          size={22}
          color={i < skullCount ? '#a855f7' : '#374151'}
          strokeWidth={2.5}
          style={{
            opacity: i < skullCount ? 1 : 0.3,
            transition: 'color 0.15s, opacity 0.15s',
          }}
        />
      ))}
    </div>
  )

  if (isDanger) {
    return (
      <motion.div
        animate={{
          filter: [
            'drop-shadow(0 0 3px #ef4444)',
            'drop-shadow(0 0 10px #ef4444)',
            'drop-shadow(0 0 3px #ef4444)',
          ],
          scale: [1, 1.07, 1],
        }}
        transition={{ duration: 0.65, repeat: Infinity, ease: 'easeInOut' }}
      >
        {icons}
      </motion.div>
    )
  }

  return icons
}

// ── Skull jumpscare overlay ───────────────────────────────────────────────────
function SkullJumpscareOverlay({ skullRolledVersion }: { skullRolledVersion: number }) {
  const [key, setKey] = useState(0)
  const [visible, setVisible] = useState(false)
  const prevVersion = useRef(skullRolledVersion)

  useEffect(() => {
    if (skullRolledVersion === prevVersion.current) return
    prevVersion.current = skullRolledVersion
    setKey((k) => k + 1)
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 700)
    return () => clearTimeout(t)
  }, [skullRolledVersion])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={key}
          style={{
            position: 'fixed', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 500,
          }}
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Skull
            size={160}
            color="#7c3aed"
            strokeWidth={1.5}
            style={{ filter: 'drop-shadow(0 0 24px #a855f7)' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Flying orbs ──────────────────────────────────────────────────────────────
type Orb = { id: number; color: string; shadow: string; sx: number; sy: number; ex: number; ey: number }

function OrbLayer({ playedDice, orbVersion, resolvingDieIndex, damageRef, healRef, shieldRef, skullRef, goldRef }: {
  playedDice: Die[]
  orbVersion: number
  resolvingDieIndex: number | null
  damageRef: React.RefObject<HTMLDivElement | null>
  healRef: React.RefObject<HTMLDivElement | null>
  shieldRef: React.RefObject<HTMLDivElement | null>
  skullRef: React.RefObject<HTMLDivElement | null>
  goldRef: React.RefObject<HTMLDivElement | null>
}) {
  const [orbs, setOrbs] = useState<Orb[]>([])
  const prevVersion = useRef(orbVersion)

  useEffect(() => {
    if (orbVersion === prevVersion.current) return
    prevVersion.current = orbVersion

    if (resolvingDieIndex === null) return
    const die = playedDice[resolvingDieIndex]
    if (!die?.currentFace) return

    const dieEl = document.querySelector(`[data-die-id="${die.id}"]`)
    if (!dieEl) return
    const dr = dieEl.getBoundingClientRect()

    const faceType = die.currentFace.type
    const targetRef = faceType === 'damage' ? damageRef
                    : faceType === 'heal'   ? healRef
                    : faceType === 'shield' ? shieldRef
                    : faceType === 'gold'   ? goldRef
                    : skullRef
    const tr = targetRef.current?.getBoundingClientRect()
    if (!tr) return

    const orb: Orb = {
      id: Date.now(),
      color: faceColor[faceType],
      shadow: faceShadow[faceType],
      sx: dr.left + dr.width  / 2,
      sy: dr.top  + dr.height / 2,
      ex: tr.left + tr.width  / 2,
      ey: tr.top  + tr.height / 2,
    }
    setOrbs([orb])
    setTimeout(() => setOrbs([]), 300)
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
          transition={{ duration: 0.21, ease: 'easeIn' }}
        />
      ))}
    </AnimatePresence>
  )
}

// ── Enemy attack orb ─────────────────────────────────────────────────────────
function EnemyOrbLayer({ enemyAttackVersion, enemyEl, playerHpRef }: {
  enemyAttackVersion: number
  enemyEl: HTMLElement | null
  playerHpRef: React.RefObject<HTMLDivElement | null>
}) {
  const [orb, setOrb] = useState<Orb | null>(null)
  const prevVersion = useRef(enemyAttackVersion)

  useEffect(() => {
    if (enemyAttackVersion === prevVersion.current) return
    prevVersion.current = enemyAttackVersion

    const sr = enemyEl?.getBoundingClientRect()
    const tr = playerHpRef.current?.getBoundingClientRect()
    if (!sr || !tr) return

    setOrb({
      id: Date.now(),
      color: '#dc2626', shadow: '#7f1d1d',
      sx: sr.left + sr.width  / 2,
      sy: sr.top  + sr.height / 2,
      ex: tr.left + tr.width  / 2,
      ey: tr.top  + tr.height / 2,
    })
    setTimeout(() => setOrb(null), 300)
  }, [enemyAttackVersion])

  const S = 10
  return (
    <AnimatePresence>
      {orb && (
        <motion.div
          key={orb.id}
          style={{
            position: 'fixed',
            width: S, height: S,
            background: orb.color,
            border: '2px solid #000',
            boxShadow: `2px 2px 0 ${orb.shadow}`,
            pointerEvents: 'none',
            zIndex: 100,
          }}
          initial={{ left: orb.sx - S / 2, top: orb.sy - S / 2, scale: 1 }}
          animate={{ left: orb.ex - S / 2, top: orb.ey - S / 2, scale: 0.5 }}
          transition={{ duration: 0.21, ease: 'easeIn' }}
        />
      )}
    </AnimatePresence>
  )
}

// ── Intent badge ──────────────────────────────────────────────────────────────
function IntentBadge({ intent }: { intent: EnemyIntent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Swords size={18} color="#f87171" strokeWidth={2.5} />
      <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f87171',
                     textShadow: '1px 1px 0 #000' }}>
        {intent.value}
      </span>
    </div>
  )
}

// ── Floating effect popups ───────────────────────────────────────────────────
type FloatItem = { id: number; label: string; color: string; shadow: string; offset: number }

function FloatingEffects({ heal, shield, gold, version }: { heal: number; shield: number; gold: number; version: number }) {
  const [items, setItems] = useState<FloatItem[]>([])
  const prevVersion = useRef(version)

  useEffect(() => {
    if (version === prevVersion.current) return
    prevVersion.current = version

    const now = Date.now()
    const next: FloatItem[] = []
    if (heal > 0)   next.push({ id: now,     label: `♥ +${heal}`,   color: '#4ade80', shadow: '#15803d', offset: -36 })
    if (shield > 0) next.push({ id: now + 1, label: `⬡ +${shield}`, color: '#38bdf8', shadow: '#1e3a8a', offset:   0 })
    if (gold > 0)   next.push({ id: now + 2, label: `$ +${gold}`,   color: '#fbbf24', shadow: '#78350f', offset:  36 })
    if (!next.length) return

    setItems((prev) => [...prev, ...next])
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => !next.find((n) => n.id === i.id)))
    }, 1150)
  }, [version, heal, shield, gold])

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
    player, enemy,
    drawPile, playedDice, skullCount, skullRolledVersion,
    totalDamage, totalHeal, totalShield, totalGold,
    lastEffects, turnPhase,
    enemyHitVersion, playerHitVersion, playerEffectVersion,
    orbVersion, counterVersion, rollStartVersion, resolvingDieIndex, resolvingPhase, enemyAttackVersion,
    currentFloor, drawAndRoll, bankAndAttack,
  } = useGameStore()

  const enemyScope  = useHitAnimation(enemyHitVersion,  'rgba(220,38,38,0.45)')
  const playerScope = useHitAnimation(playerHitVersion, 'rgba(220,38,38,0.45)')

  const [lungeScope, animateLunge] = useAnimate()
  const prevAttackVersion = useRef(enemyAttackVersion)
  useEffect(() => {
    if (enemyAttackVersion === prevAttackVersion.current) return
    prevAttackVersion.current = enemyAttackVersion
    animateLunge(lungeScope.current, { y: [0, 22, 0] }, { duration: 0.35, ease: 'easeOut' })
  }, [enemyAttackVersion])

  const damageRef   = useRef<HTMLDivElement>(null)
  const healRef     = useRef<HTMLDivElement>(null)
  const shieldRef   = useRef<HTMLDivElement>(null)
  const skullRef    = useRef<HTMLDivElement>(null)
  const goldRef     = useRef<HTMLDivElement>(null)
  const playerHpRef = useRef<HTMLDivElement>(null)

  // Screen shake on every die slam
  const [shakeRef, animateShake] = useAnimate()
  const prevPhase = useRef<ResolvingPhase>(null)
  useEffect(() => {
    if (resolvingPhase === 'landed' && prevPhase.current === 'spinning') {
      animateShake(shakeRef.current, { x: [0, -6, 6, -4, 4, -2, 0] }, { duration: 0.28, ease: 'easeOut' })
    }
    prevPhase.current = resolvingPhase
  }, [resolvingPhase])

  const isIdle = turnPhase === 'idle'
  const canDraw = isIdle && drawPile.length > 0
  const canBank = isIdle && playedDice.length > 0

  const [inspectorOpen, setInspectorOpen] = useState(false)
  const bagTypes = [...new Set([...drawPile, ...playedDice].map((d) => d.dieType))] as DieType[]

  const drawButtonLabel =
    turnPhase === 'drawing'      ? '⟳ DRAWING...'
    : turnPhase === 'player_attack' ? '⚔ ATTACKING!'
    : turnPhase === 'enemy_attack'  ? '☠ ENEMY TURN...'
    : `DRAW (${drawPile.length} left)`

  return (
    <div style={{
      maxWidth: 384, margin: '0 auto', height: '100dvh',
      display: 'flex', flexDirection: 'column',
      background: '#0f0f1a', color: '#fff', overflow: 'hidden',
    }}>

      {/* Shake container wraps Zones A–C */}
      <div ref={shakeRef} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

      {/* Zone A — Enemy */}
      <div
        ref={enemyScope}
        style={{
          background: enemy.isBoss ? '#1a0505' : '#1a1a2e',
          padding: '10px 16px 12px',
          borderBottom: `3px solid ${enemy.isBoss ? '#7f1d1d' : '#000'}`,
          flex: '0 0 33.33%',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <Label>Floor {currentFloor}</Label>
          {enemy.isBoss
            ? <span style={{ fontSize: '0.6rem', color: '#ef4444', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>⚠ BOSS</span>
            : <Label>Enemy</Label>
          }
        </div>

        <motion.div ref={lungeScope} style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <EnemySprite enemyName={enemy.name} size={enemy.isBoss ? 7 : 6} />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: '1.1rem', fontWeight: 700,
                color: enemy.isBoss ? '#fca5a5' : '#f87171',
                textShadow: enemy.isBoss ? '2px 2px 0 #7f1d1d' : '2px 2px 0 #000',
              }}>
                {enemy.name}
              </span>
              <IntentBadge intent={enemy.intent} />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#d1d5db' }}>{enemy.hp} / {enemy.maxHp} HP</span>
            <HpBar hp={enemy.hp} maxHp={enemy.maxHp} color={enemy.isBoss ? '#b91c1c' : '#ef4444'} />
          </div>
        </motion.div>
      </div>

      {/* Zone B — Player / Total Damage */}
      <div
        ref={playerScope}
        style={{
          position: 'relative',
          background: '#0f0f1a', padding: '16px',
          borderBottom: '3px solid #000',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}
      >
        <FloatingEffects
          heal={lastEffects.heal}
          shield={lastEffects.shield}
          gold={lastEffects.gold}
          version={playerEffectVersion}
        />

        <div ref={playerHpRef} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Swords size={12} color="#6b7280" />
              <Label>Total Damage</Label>
            </div>
            <div ref={skullRef}>
              <SkullTracker skullCount={skullCount} />
            </div>
          </div>
          <div ref={damageRef}>
            <DamageCounter target={totalDamage} rollStartVersion={rollStartVersion} counterVersion={counterVersion} />
          </div>

          {/* Stat badges — always reserve space to prevent layout shift */}
          <div style={{
            display: 'flex', gap: 8, marginTop: 8, minHeight: 36,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <div ref={healRef}>
              <StatBadge
                target={totalHeal}
                color="#4ade80" shadow="#15803d"
                icon={<Heart size={14} color="#4ade80" strokeWidth={2.5} />}
                rollStartVersion={rollStartVersion}
                counterVersion={counterVersion}
              />
            </div>
            <div ref={shieldRef}>
              <StatBadge
                target={totalShield}
                color="#38bdf8" shadow="#1e3a8a"
                icon={<Shield size={14} color="#38bdf8" strokeWidth={2.5} />}
                rollStartVersion={rollStartVersion}
                counterVersion={counterVersion}
              />
            </div>
            <div ref={goldRef}>
              <StatBadge
                target={totalGold}
                color="#fbbf24" shadow="#78350f"
                icon={<Coins size={14} color="#fbbf24" strokeWidth={2.5} />}
                rollStartVersion={rollStartVersion}
                counterVersion={counterVersion}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enemy attack orb overlay */}
      <EnemyOrbLayer
        enemyAttackVersion={enemyAttackVersion}
        enemyEl={enemyScope.current}
        playerHpRef={playerHpRef}
      />

      {/* Player orb overlay — fixed, spans full viewport */}
      <OrbLayer
        playedDice={playedDice}
        orbVersion={orbVersion}
        resolvingDieIndex={resolvingDieIndex}
        damageRef={damageRef}
        healRef={healRef}
        shieldRef={shieldRef}
        skullRef={skullRef}
        goldRef={goldRef}
      />

      {/* Zone C — Played Dice Tray */}
      <div style={{
        flex: '0 0 40%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '12px 16px', background: '#12121f',
        overflow: 'auto',
      }}>
        <span style={{ fontSize: '0.55rem', color: '#374151', letterSpacing: '0.3em', textTransform: 'uppercase' }}>played dice</span>
        {playedDice.length === 0 ? (
          <span style={{ color: '#374151', fontSize: '0.75rem' }}>Draw a die to start!</span>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {playedDice.map((die, i) => (
              <DieCard
                key={die.id}
                die={die}
                isResolving={i === resolvingDieIndex}
                resolvingPhase={resolvingPhase}
              />
            ))}
          </div>
        )}
      </div>

      </div>{/* end shake container */}

      {/* Zone D — Actions */}
      <div style={{
        background: '#1a1a2e', padding: '16px', borderTop: '3px solid #000',
        display: 'flex', gap: 10,
      }}>
        <button
          onClick={drawAndRoll}
          disabled={!canDraw}
          className="pixel-btn"
          style={{
            flex: 1,
            background: canDraw ? '#4f46e5' : '#374151',
            opacity: !isIdle ? 0.75 : canDraw ? 1 : 0.5,
            cursor: canDraw ? 'pointer' : 'not-allowed',
          }}
        >
          {drawButtonLabel}
        </button>
        <button
          onClick={bankAndAttack}
          disabled={!canBank}
          className="pixel-btn"
          style={{
            flex: 1,
            background: canBank ? '#b45309' : '#374151',
            opacity: canBank ? 1 : 0.5,
            cursor: canBank ? 'pointer' : 'not-allowed',
          }}
        >
          ATTACK!
        </button>
        <button
          onClick={() => setInspectorOpen(true)}
          disabled={bagTypes.length === 0}
          className="pixel-btn"
          style={{
            width: 48, flexShrink: 0,
            background: '#1e293b',
            opacity: bagTypes.length > 0 ? 1 : 0.4,
            cursor: bagTypes.length > 0 ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0,
          }}
        >
          <Library size={18} color="#9ca3af" />
        </button>
      </div>

      {inspectorOpen && bagTypes.length > 0 && (
        <DiceInspectorModal
          types={bagTypes}
          onClose={() => setInspectorOpen(false)}
        />
      )}

      <SkullJumpscareOverlay skullRolledVersion={skullRolledVersion} />
    </div>
  )
}
