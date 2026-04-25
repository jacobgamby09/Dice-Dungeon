import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { useGameStore, getClassPreviewDice } from '../store/gameStore'
import type { DieType } from '../store/gameStore'
import { DieCard, dieTypeStyle } from './DieCard'
import { DiceInspectorModal } from './DiceInspectorModal'
import { SkillTree } from './SkillTree'
import { DiceLibrary } from './DiceLibrary'

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

const TYPE_LEGEND = [
  { type: 'white',  label: 'White — Damage' },
  { type: 'blue',   label: 'Blue — Shield' },
  { type: 'green',  label: 'Green — Heal' },
  { type: 'cursed', label: 'Cursed — Skull' },
] as const

export function LoadoutScreen() {
  const { currentFloor, startCombat } = useGameStore()
  const metaSouls       = useGameStore((s) => s.metaSouls)
  const unlockedNodes   = useGameStore((s) => s.unlockedNodes)
  const selectedClass   = useGameStore((s) => s.selectedClass)
  const setSelectedClass = useGameStore((s) => s.setSelectedClass)

  const previewDice = getClassPreviewDice(selectedClass)
  const canStart = true

  const [inspectorType, setInspectorType] = useState<DieType | null>(null)
  const [showTalents, setShowTalents]   = useState(false)
  const [showLibrary, setShowLibrary]   = useState(false)

  return (
    <div style={{
      maxWidth: 384, margin: '0 auto', height: '100dvh',
      display: 'flex', flexDirection: 'column',
      background: '#0f0f1a', color: '#fff', overflow: 'hidden',
      position: 'relative',
    }}>

      {/* Header */}
      <div style={{
        background: '#1a1a2e', padding: '12px 16px',
        borderBottom: '3px solid #000',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Label>Loadout</Label>
        <Label>Floor {currentFloor}</Label>
      </div>

      {/* Souls strip */}
      <div style={{
        background: '#0f0f1a', padding: '8px 16px',
        borderBottom: '2px solid #000',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Flame size={16} color="#a855f7" strokeWidth={2.5} />
        <motion.span
          key={metaSouls}
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 0.3 }}
          style={{ fontSize: '1.2rem', fontWeight: 900, color: '#a855f7', lineHeight: 1 }}
        >
          {metaSouls}
        </motion.span>
        <span style={{ fontSize: '0.6rem', color: '#7c3aed', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Souls
        </span>
      </div>

      {/* Die type legend — clickable inspector buttons */}
      <div style={{
        background: '#12121f', padding: '10px 16px',
        borderBottom: '2px solid #000',
        display: 'flex', gap: 8,
      }}>
        {TYPE_LEGEND.map(({ type, label }) => {
          const s = dieTypeStyle[type]
          return (
            <button
              key={type}
              onClick={() => setInspectorType(type)}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: '#0f0f1a',
                border: `2px solid ${s.shadow}`,
                boxShadow: `2px 2px 0 ${s.shadow}`,
                padding: '7px 4px',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <div style={{
                width: 14, height: 14, flexShrink: 0,
                background: s.bg, border: '2px solid #000',
                boxShadow: `1px 1px 0 ${s.shadow}`,
              }} />
              <span style={{ fontSize: '0.6rem', color: '#d1d5db', letterSpacing: '0.08em' }}>{label}</span>
            </button>
          )
        })}
      </div>

      {/* Starting loadout preview */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Label>Starting Bag ({previewDice.length} dice)</Label>
          <span style={{
            fontSize: '0.6rem', color: '#9ca3af', letterSpacing: '0.1em',
            background: 'rgba(0,0,0,0.45)', padding: '2px 6px',
          }}>
            {(() => {
              let hp = selectedClass === 'gambler' ? 80 : 100
              if (unlockedNodes.includes('fyuwvmzq')) hp += 10
              if (unlockedNodes.includes('co2xusrh')) hp += 15
              return `${hp} HP`
            })()}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {previewDice.map((die) => (
            <DieCard key={die.id} die={die} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#1a1a2e', padding: '16px', borderTop: '3px solid #000', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => setShowTalents(true)}
          className="pixel-btn"
          style={{ background: '#7c3aed', color: '#ede9fe', textShadow: '1px 1px 0 #4c1d95' }}
        >
          ✦ TALENTS
        </button>
        <button
          onClick={() => setShowLibrary(true)}
          className="pixel-btn"
          style={{ background: '#b45309', color: '#fef3c7', textShadow: '1px 1px 0 #78350f' }}
        >
          ✦ LIBRARY
        </button>

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: '0.6rem', color: '#6b7280', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Class
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                {available.map((cls) => {
                  const theme = selectedClass === cls.id ? cls.active : cls.inactive
                  return (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClass(cls.id)}
                      style={{
                        flex: 1, padding: '8px 4px',
                        fontFamily: 'inherit', fontSize: '0.7rem', fontWeight: 700,
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

        <button
          onClick={startCombat}
          disabled={!canStart}
          className="pixel-btn"
          style={{
            background: canStart ? '#16a34a' : '#374151', color: '#f0fdf4', textShadow: canStart ? '1px 1px 0 #14532d' : 'none',
            opacity: canStart ? 1 : 0.7,
            cursor: canStart ? 'pointer' : 'not-allowed',
          }}
        >
          ▶ START COMBAT
        </button>
      </div>

      {inspectorType && (
        <DiceInspectorModal
          types={[inspectorType]}
          onClose={() => setInspectorType(null)}
        />
      )}
      {showTalents  && <SkillTree    onClose={() => setShowTalents(false)}  />}
      {showLibrary  && <DiceLibrary  onClose={() => setShowLibrary(false)}  />}

      {/* DEV: grant souls */}
      <button
        onClick={() => useGameStore.setState((s) => ({ metaSouls: s.metaSouls + 10000 }))}
        style={{
          position: 'absolute', bottom: 8, left: 8,
          background: 'none', border: '1px solid #374151',
          color: '#6b7280', fontSize: '0.55rem', padding: '3px 7px',
          cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em',
          opacity: 0.35,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.35')}
      >
        DEV: +10k Souls
      </button>
    </div>
  )
}
