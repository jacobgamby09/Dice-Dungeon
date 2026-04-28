import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, ShieldAlert, Swords } from 'lucide-react'
import { useGameStore, getCurrentAct, GAME_ACTS } from '../store/gameStore'
import type { Die, DieType } from '../store/gameStore'
import { dieTypeStyle } from './DieCard'
import { DiceInspectorModal } from './DiceInspectorModal'
import { SkillTree } from './SkillTree'
import { DiceLibrary } from './DiceLibrary'

// ── Die display names ─────────────────────────────────────────────────────────

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

// ── Act modifier meta ─────────────────────────────────────────────────────────

const MODIFIER_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  none:       { label: 'No Modifier',  color: '#6b7280', icon: null },
  thorns:     { label: 'Thorns',       color: '#ef4444', icon: <ShieldAlert size={12} strokeWidth={2.5} /> },
  damage_cap: { label: 'Damage Cap',   color: '#f59e0b', icon: <Swords      size={12} strokeWidth={2.5} /> },
}

// ── Compact die chip ──────────────────────────────────────────────────────────

function DieChip({ die, onClick }: { die: Die; onClick: () => void }) {
  const s = dieTypeStyle[die.dieType]
  return (
    <button
      onClick={onClick}
      style={{
        background: s.bg,
        border: '2px solid #000',
        boxShadow: `2px 2px 0 ${s.shadow}`,
        padding: '5px 8px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: 5,
        color: s.text,
        fontSize: '0.68rem', fontWeight: 700,
        letterSpacing: '0.05em',
        transition: 'opacity 0.1s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
    >
      <div style={{
        width: 8, height: 8, flexShrink: 0,
        background: s.text, border: '1px solid rgba(0,0,0,0.4)',
      }} />
      <span>{DIE_NAMES[die.dieType] ?? die.dieType}</span>
      {(die.mergeLevel ?? 0) > 0 && (
        <span style={{ color: '#fbbf24', fontSize: '0.6rem', fontWeight: 900 }}>
          +{die.mergeLevel}
        </span>
      )}
    </button>
  )
}

// ── Zone ─────────────────────────────────────────────────────────────────────

function Zone({
  label, sublabel, accent, dice, emptyText, onChipClick,
}: {
  label: string; sublabel?: string; accent: string
  dice: Die[]; emptyText: string
  onChipClick: (die: Die) => void
}) {
  return (
    <div style={{
      border: `2px solid ${accent}`,
      background: '#0d0d1a',
      display: 'flex', flexDirection: 'column', gap: 0,
    }}>
      {/* Zone header */}
      <div style={{
        background: '#1a1a2e',
        borderBottom: `2px solid ${accent}`,
        padding: '5px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '0.6rem', color: accent, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 700 }}>
          {label}
        </span>
        {sublabel && (
          <span style={{ fontSize: '0.55rem', color: '#6b7280', letterSpacing: '0.1em' }}>
            {sublabel}
          </span>
        )}
      </div>

      {/* Chips */}
      <div style={{ padding: '8px 10px', display: 'flex', flexWrap: 'wrap', gap: 5, minHeight: 48 }}>
        {dice.length === 0 ? (
          <span style={{ fontSize: '0.65rem', color: '#4b5563', fontStyle: 'italic', alignSelf: 'center' }}>
            {emptyText}
          </span>
        ) : dice.map((die) => (
          <DieChip key={die.id} die={die} onClick={() => onChipClick(die)} />
        ))}
      </div>
    </div>
  )
}

// ── Loadout screen ────────────────────────────────────────────────────────────

export function LoadoutScreen() {
  const {
    currentFloor, startCombat, devJumpToForge,
    inventory, maxEquippedDice, toggleEquipDie,
  } = useGameStore()
  const metaSouls       = useGameStore((s) => s.metaSouls)
  const unlockedNodes   = useGameStore((s) => s.unlockedNodes)
  const selectedClass   = useGameStore((s) => s.selectedClass)
  const setSelectedClass = useGameStore((s) => s.setSelectedClass)

  const [inspectorDie, setInspectorDie] = useState<Die | null>(null)
  const [showTalents, setShowTalents]   = useState(false)
  const [showLibrary, setShowLibrary]   = useState(false)

  const currentAct  = getCurrentAct(currentFloor)
  const modMeta     = MODIFIER_META[currentAct.modifier]
  const equipped    = inventory.filter((d) => d.isEquipped !== false)
  const unequipped  = inventory.filter((d) => d.isEquipped === false)
  const canStart    = equipped.length > 0

  function handleChipClick(die: Die) {
    toggleEquipDie(die.id)
  }

  return (
    <div style={{
      maxWidth: 384, margin: '0 auto', height: '100dvh',
      display: 'flex', flexDirection: 'column',
      background: '#0f0f1a', color: '#fff', overflow: 'hidden',
      position: 'relative',
    }}>

      {/* Header */}
      <div style={{
        background: '#1a1a2e', padding: '10px 16px',
        borderBottom: '3px solid #000',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: '0.6rem', color: '#9ca3af', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
          Loadout
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.6rem', color: '#6b7280', letterSpacing: '0.1em' }}>
            Floor {currentFloor}
          </span>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700,
            color: equipped.length > maxEquippedDice ? '#ef4444'
                 : equipped.length === maxEquippedDice ? '#22c55e'
                 : '#9ca3af',
            letterSpacing: '0.1em',
          }}>
            {equipped.length} / {maxEquippedDice}
          </span>
        </div>
      </div>

      {/* Souls strip */}
      <div style={{
        background: '#0f0f1a', padding: '6px 16px',
        borderBottom: '2px solid #000',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Flame size={14} color="#a855f7" strokeWidth={2.5} />
        <motion.span
          key={metaSouls}
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 0.3 }}
          style={{ fontSize: '1rem', fontWeight: 900, color: '#a855f7', lineHeight: 1 }}
        >
          {metaSouls}
        </motion.span>
        <span style={{ fontSize: '0.55rem', color: '#7c3aed', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Souls
        </span>
      </div>

      {/* Act banner */}
      <div style={{
        background: '#12121f', padding: '8px 16px',
        borderBottom: '2px solid #000',
        display: 'flex', flexDirection: 'column', gap: 3,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.05em' }}>
            {currentAct.name}
          </span>
          {/* Act dots */}
          <div style={{ display: 'flex', gap: 4 }}>
            {GAME_ACTS.map((a) => (
              <div key={a.id} style={{
                width: 8, height: 8,
                background: a.id === currentAct.id ? '#e2e8f0' : '#374151',
                border: '1px solid #000',
              }} />
            ))}
          </div>
        </div>
        <span style={{ fontSize: '0.6rem', color: '#9ca3af', letterSpacing: '0.05em' }}>
          {currentAct.description}
        </span>
        {currentAct.modifier !== 'none' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            marginTop: 2, padding: '3px 6px',
            background: 'rgba(239,68,68,0.08)',
            border: `1px solid ${modMeta.color}`,
          }}>
            <span style={{ color: modMeta.color, lineHeight: 0 }}>{modMeta.icon}</span>
            <span style={{ fontSize: '0.55rem', color: modMeta.color, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {modMeta.label} Active
            </span>
          </div>
        )}
      </div>

      {/* Scrollable body: equip zones */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px 16px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <Zone
          label="Active Loadout"
          sublabel={`tap to bench`}
          accent="#22c55e"
          dice={equipped}
          emptyText="No dice equipped — add some from Reserve below"
          onChipClick={handleChipClick}
        />
        <Zone
          label="Reserve"
          sublabel={`tap to equip`}
          accent="#4b5563"
          dice={unequipped}
          emptyText="All dice are in your active loadout"
          onChipClick={handleChipClick}
        />

        {/* Hint */}
        <p style={{ fontSize: '0.55rem', color: '#4b5563', textAlign: 'center', margin: 0, letterSpacing: '0.1em' }}>
          Only equipped dice enter the draw bag · Max {maxEquippedDice} active
        </p>
      </div>

      {/* Footer */}
      <div style={{
        background: '#1a1a2e', padding: '12px 16px',
        borderTop: '3px solid #000',
        display: 'flex', flexDirection: 'column', gap: 8,
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

        {/* Class selector */}
        {(() => {
          const CLASSES = [
            { id: 'standard',  label: 'Standard',  unlockNode: null,
              active:   { bg: '#1f2937', border: '#9ca3af', text: '#f3f4f6', shadow: '#374151' },
              inactive: { bg: '#12121f', border: '#374151', text: '#6b7280' } },
            { id: 'gambler',   label: 'Gambler',   unlockNode: 'c295l2dd',
              active:   { bg: '#4c1d95', border: '#7c3aed', text: '#c4b5fd', shadow: '#3b0764' },
              inactive: { bg: '#12121f', border: '#374151', text: '#6b7280' } },
            { id: 'scavenger', label: 'Scavenger', unlockNode: '6ts7gvct',
              active:   { bg: '#451a03', border: '#d97706', text: '#fde68a', shadow: '#92400e' },
              inactive: { bg: '#12121f', border: '#374151', text: '#6b7280' } },
          ]
          const available = CLASSES.filter(
            (c) => c.unlockNode === null || unlockedNodes.includes(c.unlockNode)
          )
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontSize: '0.55rem', color: '#6b7280', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Class
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {available.map((cls) => {
                  const theme = selectedClass === cls.id ? cls.active : cls.inactive
                  return (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClass(cls.id)}
                      style={{
                        flex: 1, padding: '7px 4px',
                        fontFamily: 'inherit', fontSize: '0.65rem', fontWeight: 700,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        background: theme.bg, color: theme.text,
                        border: `2px solid ${theme.border}`,
                        boxShadow: selectedClass === cls.id ? `3px 3px 0 ${'shadow' in theme ? theme.shadow : '#000'}` : '3px 3px 0 #000',
                        cursor: 'pointer',
                      }}
                    >
                      {cls.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })()}

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
            title="DEV: Jump to Forge with 150g + loot dice"
            style={{
              width: 44, flexShrink: 0,
              background: '#1c1c2e',
              border: '2px dashed #4b5563',
              color: '#6b7280',
              fontSize: '0.55rem', fontWeight: 700, fontFamily: 'inherit',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            }}
          >
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>🛠</span>
            <span>DEV</span>
          </button>
        </div>
      </div>

      {inspectorDie && (
        <DiceInspectorModal
          types={[inspectorDie.dieType]}
          faces={inspectorDie.faces}
          onClose={() => setInspectorDie(null)}
        />
      )}
      {showTalents && <SkillTree   onClose={() => setShowTalents(false)} />}
      {showLibrary && <DiceLibrary onClose={() => setShowLibrary(false)} />}

      {/* DEV: grant souls */}
      <button
        onClick={() => useGameStore.setState((s) => ({ metaSouls: s.metaSouls + 10000 }))}
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
