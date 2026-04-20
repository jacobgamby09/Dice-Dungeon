import { useGameStore } from '../store/gameStore'
import { DieCard, EmptySlot, dieTypeStyle } from './DieCard'

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

// Small legend showing each die type and its speciality
const TYPE_LEGEND = [
  { type: 'white', label: 'White — Damage' },
  { type: 'blue',  label: 'Blue — Shield' },
  { type: 'green', label: 'Green — Heal' },
] as const

export function LoadoutScreen() {
  const { inventory, equippedDice, currentFloor, equipDie, unequipDie, startCombat } = useGameStore()

  const canStart = equippedDice.length === 5
  const slotsLeft = 5 - equippedDice.length

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

      {/* Die type legend */}
      <div style={{
        background: '#12121f', padding: '8px 16px',
        borderBottom: '2px solid #000',
        display: 'flex', justifyContent: 'center', gap: 16,
      }}>
        {TYPE_LEGEND.map(({ type, label }) => {
          const s = dieTypeStyle[type]
          return (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 12, height: 12,
                background: s.bg, border: '2px solid #000',
                boxShadow: `2px 2px 0 ${s.shadow}`,
              }} />
              <span style={{ fontSize: '0.6rem', color: '#9ca3af', letterSpacing: '0.1em' }}>{label}</span>
            </div>
          )
        })}
      </div>

      {/* Equipped Slots */}
      <div style={{
        background: '#1a1a2e', padding: '14px 16px',
        borderBottom: '3px solid #000',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Label>Equipped ({equippedDice.length}/5)</Label>
          {equippedDice.length > 0 && (
            <span style={{ fontSize: '0.6rem', color: '#6b7280', letterSpacing: '0.1em' }}>
              TAP TO REMOVE
            </span>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          {Array.from({ length: 5 }).map((_, i) => {
            const die = equippedDice[i]
            return die
              ? <DieCard key={die.id} die={die} onClick={() => unequipDie(die.id)} />
              : <EmptySlot key={`slot-${i}`} />
          })}
        </div>
      </div>

      {/* Inventory */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Label>Inventory ({inventory.length})</Label>
          {!canStart && (
            <span style={{ fontSize: '0.6rem', color: '#6b7280', letterSpacing: '0.1em' }}>
              TAP TO EQUIP
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {inventory.map((die) => (
            <DieCard
              key={die.id}
              die={die}
              onClick={canStart ? undefined : () => equipDie(die.id)}
              dimmed={canStart}
            />
          ))}
          {inventory.length === 0 && (
            <span style={{ color: '#4b5563', fontSize: '0.8rem', padding: '20px 0' }}>
              All dice equipped!
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
          {canStart ? '▶ START COMBAT' : `EQUIP ${slotsLeft} MORE`}
        </button>
      </div>
    </div>
  )
}
