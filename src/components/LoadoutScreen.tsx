import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import type { DieType } from '../store/gameStore'
import { DieCard, dieTypeStyle } from './DieCard'
import { DiceInspectorModal } from './DiceInspectorModal'

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
  const { inventory, currentFloor, startCombat } = useGameStore()

  const canStart = inventory.length > 0

  const [inspectorType, setInspectorType] = useState<DieType | null>(null)

  return (
    <div style={{
      maxWidth: 384, margin: '0 auto', height: '100dvh',
      display: 'flex', flexDirection: 'column',
      background: '#0f0f1a', color: '#fff', overflow: 'hidden',
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

      {/* Bag */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <Label>Your Bag ({inventory.length} dice)</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {inventory.map((die) => (
            <DieCard key={die.id} die={die} />
          ))}
          {inventory.length === 0 && (
            <span style={{ color: '#4b5563', fontSize: '0.8rem', padding: '20px 0' }}>
              No dice in bag!
            </span>
          )}
        </div>
      </div>

      {/* Start Button */}
      <div style={{ background: '#1a1a2e', padding: '16px', borderTop: '3px solid #000' }}>
        <button
          onClick={startCombat}
          disabled={!canStart}
          className="pixel-btn"
          style={{
            background: canStart ? '#4f46e5' : '#374151',
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
    </div>
  )
}
