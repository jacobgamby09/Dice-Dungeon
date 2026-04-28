import { useState } from 'react'
import { Coins, Swords, Shield, Heart, Skull, Droplets, Star, Shuffle, Lock, LockOpen } from 'lucide-react'
import { useGameStore, DIE_TEMPLATES } from '../store/gameStore'
import { dieTypeStyle, faceColor } from './DieCard'
import { DiceInspectorModal } from './DiceInspectorModal'
import type { DieType, DieFace, Die } from '../store/gameStore'

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

// ── Face icon ─────────────────────────────────────────────────────────────────

function FaceIcon({ type, size = 13 }: { type: DieFace['type']; size?: number }) {
  const color = faceColor[type]
  if (type === 'damage')      return <Swords   size={size} color={color} strokeWidth={2.5} />
  if (type === 'shield')      return <Shield   size={size} color={color} strokeWidth={2.5} />
  if (type === 'skull')       return <Skull    size={size} color={color} strokeWidth={2.5} />
  if (type === 'gold')        return <Coins    size={size} color={color} strokeWidth={2.5} />
  if (type === 'lifesteal')   return <Droplets size={size} color={color} strokeWidth={2.5} />
  if (type === 'choose_next') return <Star     size={size} color={color} strokeWidth={2.5} />
  if (type === 'wildcard')    return <Shuffle  size={size} color={color} strokeWidth={2.5} />
  return <Heart size={size} color={color} strokeWidth={2.5} />
}

// ── Rarity color ──────────────────────────────────────────────────────────────

const RARITY_COLOR: Record<string, string> = {
  common:    '#6b7280',
  uncommon:  '#22c55e',
  rare:      '#818cf8',
  legendary: '#f59e0b',
}

// ── Single die choice card ────────────────────────────────────────────────────

function DieChoiceCard({
  dieType, isLocked, onSelect, onToggleLock,
}: {
  dieType: DieType
  isLocked: boolean; onSelect: () => void; onToggleLock: () => void
}) {
  const template = DIE_TEMPLATES[dieType]
  const s = dieTypeStyle[dieType]
  const name = DIE_NAMES[dieType] ?? dieType

  return (
    <div style={{
      background: '#1a1a2e',
      border: `3px solid ${isLocked ? '#d97706' : '#000'}`,
      boxShadow: `4px 4px 0 ${isLocked ? '#92400e' : '#000'}`,
      padding: '14px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Die header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 18, height: 18, flexShrink: 0,
          background: s.bg,
          border: '2px solid #000',
          boxShadow: `2px 2px 0 ${s.shadow}`,
        }} />
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: s.bg, flex: 1 }}>
          {name}
        </span>
        <span style={{
          fontSize: '0.55rem', fontWeight: 700,
          color: RARITY_COLOR[template.rarity] ?? '#6b7280',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          border: `1px solid ${RARITY_COLOR[template.rarity] ?? '#6b7280'}`,
          padding: '2px 5px',
        }}>
          {template.rarity}
        </span>
        {/* Lock toggle */}
        <button
          onClick={onToggleLock}
          title={isLocked ? 'Unlock (carry to next draft)' : 'Lock (carry to next draft)'}
          style={{
            background: isLocked ? '#92400e' : '#1e293b',
            border: `2px solid ${isLocked ? '#d97706' : '#374151'}`,
            boxShadow: isLocked ? '2px 2px 0 #78350f' : 'none',
            padding: '4px 5px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 0, flexShrink: 0,
          }}
        >
          {isLocked
            ? <Lock     size={12} color="#fbbf24" strokeWidth={2.5} />
            : <LockOpen size={12} color="#6b7280" strokeWidth={2.5} />
          }
        </button>
      </div>

      {/* Face grid: 3 columns × 2 rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {template.faces.map((face, i) => (
          <div
            key={i}
            style={{
              background: s.bg,
              border: '2px solid #000',
              boxShadow: `2px 2px 0 ${s.shadow}`,
              padding: '8px 4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}
          >
            {face.type === 'blank' ? null
              : face.type === 'multiplier' ? (
                <span style={{ fontSize: '0.9rem', fontWeight: 900, color: s.text, lineHeight: 1 }}>
                  ×{face.value}
                </span>
              ) : face.type === 'purified_skull' ? (
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Skull size={18} color="#ffffff" strokeWidth={2.5} />
                  <svg style={{ position: 'absolute', pointerEvents: 'none' }} width="24" height="24" viewBox="0 0 24 24">
                    <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="22" y1="2" x2="2" y2="22" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
                  </svg>
                </div>
              ) : (face.type === 'skull' || face.type === 'choose_next' || face.type === 'wildcard') ? (
                <FaceIcon type={face.type} size={18} />
              ) : (
                <>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: s.text, lineHeight: 1 }}>
                    {face.value}
                  </span>
                  <FaceIcon type={face.type} size={12} />
                </>
              )}
          </div>
        ))}
      </div>

      {/* Select button */}
      <button
        onClick={onSelect}
        className="pixel-btn"
        style={{ background: s.shadow, color: '#fff', textShadow: '1px 1px 0 #000', letterSpacing: '0.2em' }}
      >
        SELECT
      </button>
    </div>
  )
}

// ── Draft screen ──────────────────────────────────────────────────────────────

export function DraftScreen() {
  const { draftChoices, lastGoldEarned, gold, rerollCost, selectDraftDie, rerollDraft } = useGameStore()
  const inventory = useGameStore((s) => s.inventory)
  const [lockedIds, setLockedIds] = useState<Set<string>>(new Set())
  const [showBagModal, setShowBagModal] = useState(false)
  const [inspectorDie, setInspectorDie] = useState<Die | null>(null)

  function toggleLock(id: string) {
    setLockedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const allLocked = draftChoices.length > 0 && draftChoices.every((d) => lockedIds.has(d.id))
  const canReroll = gold >= rerollCost && !allLocked

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
        <span style={{
          fontSize: '1.1rem', fontWeight: 700,
          color: '#fbbf24', textShadow: '2px 2px 0 #78350f',
          letterSpacing: '0.1em',
        }}>
          VICTORY!
        </span>
        {lastGoldEarned > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Coins size={14} color="#fbbf24" strokeWidth={2.5} />
            <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem' }}>
              +{lastGoldEarned} Gold
            </span>
          </div>
        )}
      </div>

      {/* Subheader */}
      <div style={{
        background: '#12121f', padding: '10px 16px',
        borderBottom: '2px solid #000',
        textAlign: 'center',
      }}>
        <span style={{
          fontSize: '0.65rem', color: '#9ca3af',
          letterSpacing: '0.3em', textTransform: 'uppercase',
        }}>
          Choose your reward · Lock to carry forward
        </span>
      </div>

      {/* Die choices */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {draftChoices.map((die) => (
          <DieChoiceCard
            key={die.id}
            dieType={die.dieType}
            isLocked={lockedIds.has(die.id)}
            onToggleLock={() => toggleLock(die.id)}
            onSelect={() => {
              const otherLockedIds = draftChoices
                .filter((d) => d.id !== die.id && lockedIds.has(d.id))
                .map((d) => d.id)
              selectDraftDie(die.id, otherLockedIds)
            }}
          />
        ))}
      </div>

      {/* View Bag strip */}
      <div style={{ padding: '8px 16px', background: '#0f0f1a' }}>
        <button
          onClick={() => setShowBagModal(true)}
          style={{
            width: '100%', padding: '10px',
            background: '#1e293b',
            border: '2px solid #374151',
            boxShadow: '3px 3px 0 #000',
            color: '#94a3b8',
            fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          VIEW BAG
        </button>
      </div>

      {/* Re-roll footer */}
      <div style={{ background: '#1a1a2e', padding: '12px 16px', borderTop: '3px solid #000' }}>
        <button
          onClick={() => rerollDraft([...lockedIds])}
          disabled={!canReroll}
          className="pixel-btn"
          style={{
            background: canReroll ? '#7c3aed' : '#374151',
            color: '#e9d5ff',
            textShadow: '1px 1px 0 #000',
            opacity: canReroll ? 1 : 0.5,
          }}
        >
          <Coins size={13} strokeWidth={2.5} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          RE-ROLL DICE (-{rerollCost} Gold)
        </button>
      </div>

      {/* Bag modal */}
      {showBagModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.88)',
          zIndex: 100,
          maxWidth: 384, margin: '0 auto',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            background: '#1a1a2e', padding: '12px 16px',
            borderBottom: '3px solid #000',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.65rem', color: '#9ca3af', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
              Your Bag
            </span>
            <span style={{ fontSize: '0.65rem', color: '#6b7280', letterSpacing: '0.1em' }}>
              {inventory.length} dice
            </span>
          </div>
          <div style={{
            flex: 1, overflowY: 'auto', padding: '10px 14px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {inventory.length === 0 ? (
              <span style={{ color: '#6b7280', fontSize: '0.8rem', textAlign: 'center', padding: '12px 0' }}>
                Bag is empty
              </span>
            ) : inventory.map((die) => {
              const s = dieTypeStyle[die.dieType]
              return (
                <button
                  key={die.id}
                  onClick={() => setInspectorDie(die)}
                  style={{
                    background: '#12121f', border: `2px solid ${s.shadow}`,
                    boxShadow: `3px 3px 0 ${s.shadow}`,
                    padding: '8px 10px', cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1a2e')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#12121f')}
                >
                  <div style={{
                    width: 14, height: 14, flexShrink: 0,
                    background: s.bg, border: '2px solid #000',
                    boxShadow: `1px 1px 0 ${s.shadow}`,
                  }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: s.bg, flex: 1, letterSpacing: '0.05em' }}>
                    {DIE_NAMES[die.dieType] ?? die.dieType}
                    {(die.mergeLevel ?? 0) > 0 && (
                      <span style={{ color: '#f59e0b', fontWeight: 900, marginLeft: 4 }}>+{die.mergeLevel}</span>
                    )}
                  </span>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {die.faces.map((face, i) => (
                      <div key={i} style={{
                        width: 28, height: 28,
                        background: s.bg, border: '2px solid #000',
                        boxShadow: `1px 1px 0 ${s.shadow}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 700,
                        color: face.type === 'skull' || face.type === 'purified_skull' ? faceColor.skull : s.text,
                      }}>
                        {face.type === 'skull' ? '💀'
                          : face.type === 'purified_skull' ? '☠'
                          : face.type === 'choose_next' ? '✦'
                          : face.type === 'wildcard' ? '~'
                          : face.type === 'blank' ? ''
                          : face.value}
                      </div>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
          <div style={{ background: '#1a1a2e', padding: '12px 16px', borderTop: '3px solid #000' }}>
            <button
              onClick={() => { setShowBagModal(false); setInspectorDie(null) }}
              className="pixel-btn"
              style={{ background: '#374151' }}
            >
              BACK TO DRAFT
            </button>
          </div>
        </div>
      )}

      {inspectorDie && (
        <DiceInspectorModal
          types={[inspectorDie.dieType]}
          faces={inspectorDie.faces}
          mergeLevel={inspectorDie.mergeLevel}
          onClose={() => setInspectorDie(null)}
        />
      )}
    </div>
  )
}
