import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Lock, ShieldAlert, Swords, Shield, Heart, Skull, Droplets, Star, Shuffle } from 'lucide-react'
import { useGameStore, getCurrentAct, GAME_ACTS, DIE_TEMPLATES, UNIQUE_DIE_TYPES } from '../store/gameStore'
import type { Die, DieType, DieFace } from '../store/gameStore'
import { dieTypeStyle, faceColor } from './DieCard'
import { SkillTree } from './SkillTree'
import { DiceLibrary } from './DiceLibrary'

// ── Static data ───────────────────────────────────────────────────────────────

const DIE_NAMES: Partial<Record<DieType, string>> = {
  white:          'The Basic',
  blue:           'The Guard',
  green:          'The Mender',
  cursed:         'The Cursed',
  heavy:          'The Heavy',
  paladin:        'The Paladin',
  gambler:        'The Gambler',
  scavenger:      'The Scavenger',
  wall:           'The Wall',
  jackpot:        'The Jackpot',
  vampire:        'The Vampire',
  priest:         'The Priest',
  fortune_teller: 'The Fortune Teller',
  joker:          'The Joker',
  unique:         'The Multiplier',
}

const MODIFIER_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  none:       { label: 'No Modifier',      color: '#6b7280', icon: null },
  thorns:     { label: 'Thorns Active',    color: '#ef4444', icon: <ShieldAlert size={11} strokeWidth={2.5} /> },
  damage_cap: { label: 'Damage Cap Active',color: '#f59e0b', icon: <Swords      size={11} strokeWidth={2.5} /> },
}

// Infinite-supply base die types available in the pool
const BASE_POOL: DieType[] = ['white', 'blue', 'green']

// ── Face icon ─────────────────────────────────────────────────────────────────

function FaceIcon({ type, size = 13 }: { type: DieFace['type']; size?: number }) {
  const color = faceColor[type]
  if (type === 'damage')      return <Swords   size={size} color={color} strokeWidth={2.5} />
  if (type === 'shield')      return <Shield   size={size} color={color} strokeWidth={2.5} />
  if (type === 'skull')       return <Skull    size={size} color={color} strokeWidth={2.5} />
  if (type === 'souls')       return <Flame    size={size} color={color} strokeWidth={2.5} />
  if (type === 'lifesteal')   return <Droplets size={size} color={color} strokeWidth={2.5} />
  if (type === 'choose_next') return <Star     size={size} color={color} strokeWidth={2.5} />
  if (type === 'wildcard')    return <Shuffle  size={size} color={color} strokeWidth={2.5} />
  return <Heart size={size} color={color} strokeWidth={2.5} />
}

// ── Face grid (shared by base pool cards and reserve die cards) ───────────────

function FaceGrid({ faces, s }: { faces: DieFace[]; s: { bg: string; shadow: string; text: string } }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
      {faces.map((face, i) => (
        <div
          key={i}
          style={{
            background: s.bg,
            border: '2px solid #000',
            boxShadow: `2px 2px 0 ${s.shadow}`,
            padding: '5px 4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
            minHeight: 32,
          }}
        >
          {face.type === 'blank' ? null
            : face.type === 'multiplier' ? (
              <span style={{ fontSize: '0.8rem', fontWeight: 900, color: s.text, lineHeight: 1 }}>
                ×{face.value}
              </span>
            ) : face.type === 'purified_skull' ? (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Skull size={15} color="#ffffff" strokeWidth={2.5} />
                <svg style={{ position: 'absolute', pointerEvents: 'none' }} width="20" height="20" viewBox="0 0 20 20">
                  <line x1="2" y1="2" x2="18" y2="18" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                  <line x1="18" y1="2" x2="2" y2="18" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            ) : (face.type === 'skull' || face.type === 'choose_next' || face.type === 'wildcard') ? (
              <FaceIcon type={face.type} size={15} />
            ) : (
              <>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: s.text, lineHeight: 1 }}>
                  {face.value}
                </span>
                <FaceIcon type={face.type} size={10} />
              </>
            )}
        </div>
      ))}
    </div>
  )
}

// ── Equipped chip (top zone) ──────────────────────────────────────────────────

function EquippedChip({ die, onRemove }: { die: Die; onRemove: () => void }) {
  const s = dieTypeStyle[die.dieType]
  const locked = die.dieType === 'cursed'
  return (
    <button
      onClick={locked ? undefined : onRemove}
      style={{
        background: '#12121f',
        border: `2px solid ${locked ? '#7f1d1d' : s.shadow}`,
        boxShadow: `2px 2px 0 ${locked ? '#450a0a' : s.shadow}`,
        padding: '5px 7px',
        cursor: locked ? 'default' : 'pointer',
        fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: 6,
      }}
      onMouseEnter={(e) => { if (!locked) e.currentTarget.style.opacity = '0.7' }}
      onMouseLeave={(e) => { if (!locked) e.currentTarget.style.opacity = '1' }}
    >
      <div style={{
        width: 10, height: 10, flexShrink: 0,
        background: s.bg, border: '2px solid #000',
        boxShadow: `1px 1px 0 ${s.shadow}`,
      }} />
      <span style={{
        fontSize: '0.62rem', fontWeight: 700, color: s.bg,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        maxWidth: 82,
      }}>
        {DIE_NAMES[die.dieType] ?? die.dieType}{UNIQUE_DIE_TYPES.has(die.dieType) ? ' ★' : ''}
        {(die.mergeLevel ?? 0) > 0 && (
          <span style={{ color: '#f59e0b', marginLeft: 3 }}>+{die.mergeLevel}</span>
        )}
      </span>
      {locked
        ? <Lock size={9} color="#7f1d1d" strokeWidth={2.5} style={{ flexShrink: 0 }} />
        : <span style={{ fontSize: '0.5rem', color: '#6b7280', flexShrink: 0 }}>✕</span>
      }
    </button>
  )
}

// ── Infinite base pool card ───────────────────────────────────────────────────

function BasePoolCard({ dieType, onEquip, disabled }: { dieType: DieType; onEquip: () => void; disabled: boolean }) {
  const s       = dieTypeStyle[dieType]
  const tmpl    = DIE_TEMPLATES[dieType]
  const name    = `${DIE_NAMES[dieType] ?? dieType}${UNIQUE_DIE_TYPES.has(dieType) ? ' ★' : ''}`
  return (
    <button
      onClick={disabled ? undefined : onEquip}
      style={{
        background: disabled ? '#0d0d1a' : '#12121f',
        border: `2px solid ${disabled ? '#1e293b' : s.shadow}`,
        boxShadow: disabled ? 'none' : `3px 3px 0 ${s.shadow}`,
        padding: '10px 12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        display: 'flex', flexDirection: 'column', gap: 8,
        textAlign: 'left', width: '100%',
        opacity: disabled ? 0.45 : 1,
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = '#1a1a2e' }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = '#12121f' }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 14, height: 14, flexShrink: 0,
          background: s.bg, border: '2px solid #000',
          boxShadow: `2px 2px 0 ${s.shadow}`,
        }} />
        <span style={{ fontWeight: 700, fontSize: '0.8rem', color: s.bg, flex: 1 }}>
          {name}
        </span>
        {/* ∞ badge */}
        <span style={{
          fontSize: '0.75rem', fontWeight: 900, color: '#22c55e',
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid #166534',
          padding: '1px 6px', letterSpacing: '0.05em',
          flexShrink: 0,
        }}>
          ∞
        </span>
        <span style={{ fontSize: '0.55rem', color: '#22c55e', letterSpacing: '0.1em', flexShrink: 0 }}>
          {disabled ? 'FULL' : 'ADD +'}
        </span>
      </div>

      {/* Face grid using template faces */}
      <FaceGrid faces={tmpl.faces} s={s} />
    </button>
  )
}

// ── Reserved die card (owned modified dice) ───────────────────────────────────

function ReserveDieCard({ die, onEquip, disabled }: { die: Die; onEquip: () => void; disabled: boolean }) {
  const s    = dieTypeStyle[die.dieType]
  const name = `${DIE_NAMES[die.dieType] ?? die.dieType}${UNIQUE_DIE_TYPES.has(die.dieType) ? ' ★' : ''}`
  return (
    <button
      onClick={disabled ? undefined : onEquip}
      style={{
        background: disabled ? '#0d0d1a' : '#12121f',
        border: `2px solid ${disabled ? '#1e293b' : s.shadow}`,
        boxShadow: disabled ? 'none' : `3px 3px 0 ${s.shadow}`,
        padding: '10px 12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        display: 'flex', flexDirection: 'column', gap: 8,
        textAlign: 'left', width: '100%',
        opacity: disabled ? 0.45 : 1,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = '#1a1a2e' }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = '#12121f' }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 14, height: 14, flexShrink: 0,
          background: s.bg, border: '2px solid #000',
          boxShadow: `2px 2px 0 ${s.shadow}`,
        }} />
        <span style={{ fontWeight: 700, fontSize: '0.8rem', color: s.bg, flex: 1 }}>
          {name}
          {(die.mergeLevel ?? 0) > 0 && (
            <span style={{ color: '#f59e0b', fontWeight: 900, marginLeft: 4 }}>+{die.mergeLevel}</span>
          )}
        </span>
        <span style={{ fontSize: '0.55rem', color: disabled ? '#4b5563' : '#22c55e', letterSpacing: '0.1em', flexShrink: 0 }}>
          {disabled ? 'FULL' : 'EQUIP +'}
        </span>
      </div>

      {/* Actual modified faces */}
      <FaceGrid faces={die.faces} s={s} />
    </button>
  )
}

// ── Loadout screen ────────────────────────────────────────────────────────────

export function LoadoutScreen() {
  const {
    currentFloor, startCombat, devJumpToForge,
    inventory, maxEquippedDice,
    toggleEquipDie, resetLoadout, equipBaseDie,
  } = useGameStore()
  const bankedSouls        = useGameStore((s) => s.bankedSouls)

  const [showTalents, setShowTalents] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)

  // Reset to clean slate on mount
  useEffect(() => { resetLoadout() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const currentAct  = getCurrentAct(currentFloor)
  const modMeta     = MODIFIER_META[currentAct.modifier]
  const equipped    = inventory.filter((d) => d.isEquipped !== false)
  const reserved    = inventory.filter((d) => d.isEquipped === false)
  const atCapacity  = equipped.length >= maxEquippedDice
  const canStart    = equipped.length > 0

  return (
    <div style={{
      maxWidth: 384, margin: '0 auto', height: '100dvh',
      display: 'flex', flexDirection: 'column',
      background: '#0f0f1a', color: '#fff', overflow: 'hidden',
      position: 'relative',
    }}>

      {/* ── Fixed top ── */}

      {/* Header */}
      <div style={{
        background: '#1a1a2e', padding: '10px 16px',
        borderBottom: '3px solid #000',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Flame size={14} color="#a855f7" strokeWidth={2.5} />
          <motion.span
            key={bankedSouls}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.25 }}
            style={{ fontSize: '0.9rem', fontWeight: 900, color: '#a855f7' }}
          >
            {bankedSouls}
          </motion.span>
          <span style={{ fontSize: '0.55rem', color: '#7c3aed', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Souls
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {GAME_ACTS.map((a) => (
            <div key={a.id} style={{
              width: 7, height: 7,
              background: a.id === currentAct.id ? '#e2e8f0' : '#374151',
              border: '1px solid #000',
            }} />
          ))}
          <span style={{ fontSize: '0.55rem', color: '#6b7280', letterSpacing: '0.1em', marginLeft: 4 }}>
            Floor {currentFloor}
          </span>
        </div>
      </div>

      {/* Act banner */}
      <div style={{
        background: '#12121f', padding: '6px 16px',
        borderBottom: '2px solid #000',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#e2e8f0' }}>{currentAct.name}</div>
          <div style={{ fontSize: '0.55rem', color: '#9ca3af' }}>{currentAct.description}</div>
        </div>
        {currentAct.modifier !== 'none' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 6px',
            background: 'rgba(239,68,68,0.08)',
            border: `1px solid ${modMeta.color}`,
          }}>
            <span style={{ color: modMeta.color, lineHeight: 0 }}>{modMeta.icon}</span>
            <span style={{ fontSize: '0.5rem', color: modMeta.color, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {modMeta.label}
            </span>
          </div>
        )}
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* ── Equipped section ── */}
        <div style={{ padding: '10px 16px 6px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {/* Capacity heading */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: '0.6rem', color: '#9ca3af', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Choose Your {maxEquippedDice} Dice
            </span>
            <span style={{
              fontSize: '0.85rem', fontWeight: 900,
              color: equipped.length === 0 ? '#ef4444' : atCapacity ? '#22c55e' : '#f59e0b',
            }}>
              {equipped.length}/{maxEquippedDice}
            </span>
          </div>

          {/* Equipped chips */}
          {equipped.length === 0 ? (
            <div style={{
              border: '2px dashed #374151', padding: '12px',
              textAlign: 'center', fontSize: '0.65rem', color: '#4b5563',
            }}>
              No dice equipped — pick from the pool below
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
              {equipped.map((die) => (
                <EquippedChip
                  key={die.id}
                  die={die}
                  onRemove={() => toggleEquipDie(die.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div style={{ borderTop: '2px solid #1e293b', margin: '4px 16px 0' }} />

        {/* ── Infinite base pool ── */}
        <div style={{ padding: '10px 16px 4px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.6rem', color: '#6b7280', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Base Dice
            </span>
            <span style={{ fontSize: '0.55rem', color: '#22c55e', letterSpacing: '0.1em' }}>
              ∞ Unlimited Supply
            </span>
          </div>
          {BASE_POOL.map((t) => (
            <BasePoolCard
              key={t}
              dieType={t}
              onEquip={() => equipBaseDie(t)}
              disabled={atCapacity}
            />
          ))}
        </div>

        {/* ── Reserved modified dice ── */}
        {reserved.length > 0 && (
          <div style={{ padding: '10px 16px 14px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ borderTop: '2px solid #1e293b', marginBottom: 3 }} />
            <span style={{ fontSize: '0.6rem', color: '#6b7280', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Your Dice — {reserved.length} in reserve
            </span>
            {reserved.map((die) => (
              <ReserveDieCard
                key={die.id}
                die={die}
                onEquip={() => toggleEquipDie(die.id)}
                disabled={atCapacity}
              />
            ))}
          </div>
        )}

        <div style={{ height: 8 }} />
      </div>

      {/* ── Fixed footer ── */}
      <div style={{
        background: '#1a1a2e', padding: '10px 16px',
        borderTop: '3px solid #000',
        display: 'flex', flexDirection: 'column', gap: 7,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowTalents(true)}
            className="pixel-btn"
            style={{ flex: 1, background: '#7c3aed', color: '#ede9fe', textShadow: '1px 1px 0 #4c1d95', fontSize: '0.65rem' }}
          >
            ✦ TALENTS
          </button>
          <button
            onClick={() => setShowLibrary(true)}
            className="pixel-btn"
            style={{ flex: 1, background: '#b45309', color: '#fef3c7', textShadow: '1px 1px 0 #78350f', fontSize: '0.65rem' }}
          >
            ✦ LIBRARY
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={startCombat}
            disabled={!canStart}
            className="pixel-btn"
            style={{
              flex: 1,
              background: canStart ? '#16a34a' : '#374151',
              color: '#f0fdf4',
              textShadow: canStart ? '1px 1px 0 #14532d' : 'none',
              opacity: canStart ? 1 : 0.6,
              cursor: canStart ? 'pointer' : 'not-allowed',
            }}
          >
            {canStart ? '▶ START COMBAT' : '⚠ EQUIP A DIE'}
          </button>
          <button
            onClick={devJumpToForge}
            title="DEV: Jump to Forge"
            style={{
              width: 44, flexShrink: 0,
              background: '#1c1c2e', border: '2px dashed #4b5563', color: '#6b7280',
              fontSize: '0.55rem', fontWeight: 700, fontFamily: 'inherit',
              letterSpacing: '0.05em', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            }}
          >
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>🛠</span>
            <span>DEV</span>
          </button>
        </div>
      </div>

      {showTalents && <SkillTree   onClose={() => setShowTalents(false)} />}
      {showLibrary && <DiceLibrary onClose={() => setShowLibrary(false)} />}

      {/* DEV: grant souls */}
      <button
        onClick={() => useGameStore.setState((s) => ({ bankedSouls: s.bankedSouls + 10000 }))}
        style={{
          position: 'absolute', bottom: 8, left: 8,
          background: 'none', border: '1px solid #374151',
          color: '#6b7280', fontSize: '0.55rem', padding: '3px 7px',
          cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em',
          opacity: 0.35, transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.35')}
      >
        DEV: +10k Souls
      </button>
    </div>
  )
}
