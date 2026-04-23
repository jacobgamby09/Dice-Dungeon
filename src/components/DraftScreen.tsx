import { Coins, Swords, Shield, Heart, Skull, Droplets } from 'lucide-react'
import { useGameStore, DIE_TEMPLATES } from '../store/gameStore'
import { dieTypeStyle, faceColor } from './DieCard'
import type { DieType, DieFace } from '../store/gameStore'

// ── Die display names ─────────────────────────────────────────────────────────

const DIE_NAMES: Partial<Record<DieType, string>> = {
  heavy:     'THE HEAVY',
  paladin:   'THE PALADIN',
  gambler:   'THE GAMBLER',
  scavenger: 'THE SCAVENGER',
  wall:      'THE WALL',
  jackpot:   'THE JACKPOT',
  vampire:   'THE VAMPIRE',
}

// ── Face icon ─────────────────────────────────────────────────────────────────

function FaceIcon({ type, size = 13 }: { type: DieFace['type']; size?: number }) {
  const color = faceColor[type]
  if (type === 'damage')    return <Swords   size={size} color={color} strokeWidth={2.5} />
  if (type === 'shield')    return <Shield   size={size} color={color} strokeWidth={2.5} />
  if (type === 'skull')     return <Skull    size={size} color={color} strokeWidth={2.5} />
  if (type === 'gold')      return <Coins    size={size} color={color} strokeWidth={2.5} />
  if (type === 'lifesteal') return <Droplets size={size} color={color} strokeWidth={2.5} />
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

function DieChoiceCard({ dieType, onSelect }: { dieType: DieType; dieId: string; onSelect: () => void }) {
  const template = DIE_TEMPLATES[dieType]
  const s = dieTypeStyle[dieType]
  const name = DIE_NAMES[dieType] ?? dieType.toUpperCase()

  return (
    <div style={{
      background: '#1a1a2e',
      border: '3px solid #000',
      boxShadow: '4px 4px 0 #000',
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
      </div>

      {/* Face grid: 3 columns × 2 rows */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 6,
      }}>
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
            {face.type === 'skull' ? (
              <FaceIcon type="skull" size={18} />
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
  const { draftChoices, lastGoldEarned, selectDraftDie, skipDraft } = useGameStore()

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
          Choose your reward
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
            dieId={die.id}
            onSelect={() => selectDraftDie(die.id)}
          />
        ))}
      </div>

      {/* Skip footer */}
      <div style={{ background: '#1a1a2e', padding: '12px 16px', borderTop: '3px solid #000' }}>
        <button
          onClick={skipDraft}
          className="pixel-btn"
          style={{ background: '#374151', color: '#fbbf24', textShadow: '1px 1px 0 #000' }}
        >
          <Coins size={13} strokeWidth={2.5} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          SKIP DRAFT (+3 Gold)
        </button>
      </div>
    </div>
  )
}
