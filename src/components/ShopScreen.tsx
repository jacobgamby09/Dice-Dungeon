import { useState } from 'react'
import { Coins, Heart, Shield, Swords, Skull, Flame, ArrowLeft, Droplets, Star, Shuffle } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { dieTypeStyle, faceColor } from './DieCard'
import type { Die, DieFace } from '../store/gameStore'

// ── Die display names ─────────────────────────────────────────────────────────

const DIE_NAMES: Record<string, string> = {
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

// ── Shop action type ──────────────────────────────────────────────────────────

type ShopAction = 'purify' | 'empower' | 'merge' | null

// ── Action card ───────────────────────────────────────────────────────────────

function ActionCard({
  label, cost, description, disabled, accentColor, onSelect, buttonLabel,
}: {
  label: string; cost: number; description: string
  disabled: boolean; accentColor: string; onSelect: () => void
  buttonLabel?: string
}) {
  return (
    <div style={{
      background: '#1a1a2e',
      border: `3px solid ${disabled ? '#374151' : '#000'}`,
      boxShadow: disabled ? 'none' : '4px 4px 0 #000',
      padding: '14px',
      display: 'flex', flexDirection: 'column', gap: 10,
      opacity: disabled ? 0.5 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '1rem', color: accentColor }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Coins size={13} color="#fbbf24" strokeWidth={2.5} />
          <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem' }}>{cost}</span>
        </div>
      </div>
      <span style={{ fontSize: '0.7rem', color: '#9ca3af', lineHeight: 1.5 }}>
        {description}
      </span>
      <button
        disabled={disabled}
        onClick={onSelect}
        className="pixel-btn"
        style={{
          background: disabled ? '#374151' : accentColor,
          color: '#fff', fontSize: '0.9rem', padding: '10px 0',
        }}
      >
        {buttonLabel ?? label}
      </button>
    </div>
  )
}

// ── Die picker row ────────────────────────────────────────────────────────────

function DiePickerRow({ die, isHighlighted, onClick }: { die: Die; isHighlighted?: boolean; onClick: () => void }) {
  const s    = dieTypeStyle[die.dieType]
  const name = DIE_NAMES[die.dieType] ?? die.dieType.toUpperCase()
  return (
    <button
      onClick={onClick}
      style={{
        background: '#1a1a2e',
        border: `3px solid ${isHighlighted ? '#d97706' : die.isMerged ? '#facc15' : '#000'}`,
        boxShadow: isHighlighted
          ? '4px 4px 0 #d97706'
          : die.isMerged
            ? '4px 4px 0 #facc15, 0 0 12px 2px rgba(250,204,21,0.4)'
            : '4px 4px 0 #000',
        padding: '10px 14px', width: '100%', cursor: 'pointer', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
      }}
    >
      <div style={{
        width: 18, height: 18, flexShrink: 0,
        backgroundColor: s.bg, border: '2px solid #000', boxShadow: `2px 2px 0 ${s.shadow}`,
      }} />
      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: s.bg }}>{name}</span>
      {die.isMerged && (
        <span style={{ fontSize: '0.55rem', color: '#facc15', fontWeight: 700, letterSpacing: '0.15em' }}>
          MERGED
        </span>
      )}
      <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: '#6b7280', letterSpacing: '0.1em' }}>
        SELECT
      </span>
    </button>
  )
}

// ── Face picker grid ──────────────────────────────────────────────────────────

function FacePickerGrid({
  die, activeAction, onFaceSelect,
}: {
  die: Die; activeAction: 'purify' | 'empower'
  onFaceSelect: (faceIndex: number, face: DieFace) => void
}) {
  const s = dieTypeStyle[die.dieType]

  function isEligible(face: DieFace) {
    if (activeAction === 'purify')  return face.type === 'skull'
    if (activeAction === 'empower') return face.type === 'damage' || face.type === 'shield'
    return false
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {die.faces.map((face, i) => {
        const eligible = isEligible(face)
        return (
          <button
            key={i}
            disabled={!eligible}
            onClick={() => onFaceSelect(i, face)}
            style={{
              backgroundColor: eligible ? s.bg : '#1a1a2e',
              border: `2px solid ${eligible ? '#000' : '#374151'}`,
              boxShadow: eligible ? `3px 3px 0 ${s.shadow}` : 'none',
              padding: '14px 4px',
              cursor: eligible ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              opacity: eligible ? 1 : 0.3,
            }}
          >
            {face.type === 'skull' ? (
              <Skull size={22} color={faceColor.skull} strokeWidth={2.5} />
            ) : (
              <>
                <span style={{
                  fontSize: '1.2rem', fontWeight: 700, lineHeight: 1,
                  color: eligible ? s.text : '#6b7280',
                }}>
                  {face.value}
                </span>
                <FaceIcon type={face.type} size={14} />
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Shop screen ───────────────────────────────────────────────────────────────

export function ShopScreen() {
  const {
    player, gold, inventory, lastGoldEarned, justDefeatedBoss,
    shopHeal, shopModifyFace, shopMergeDice, leaveShop,
    purifyUsesThisShop,
  } = useGameStore()
  const unlockedNodes = useGameStore((s) => s.unlockedNodes)
  const healCost  = unlockedNodes.includes('7jutuf9h') ? 5  : 10
  const mergeCost = unlockedNodes.includes('m1hjf9ac') ? 25 : 40

  const [activeAction, setActiveAction]   = useState<ShopAction>(null)
  const [selectedDieId, setSelectedDieId] = useState<string | null>(null)
  const [firstMergeId, setFirstMergeId]   = useState<string | null>(null)
  const [mergeError, setMergeError]       = useState(false)

  const selectedDie = selectedDieId
    ? inventory.find((d) => d.id === selectedDieId) ?? null
    : null

  function handleFaceSelect(faceIndex: number, face: DieFace) {
    if (!selectedDieId) return
    if (activeAction === 'purify') {
      shopModifyFace(selectedDieId, faceIndex, { type: 'damage', value: 0 }, 20)
    } else if (activeAction === 'empower') {
      shopModifyFace(selectedDieId, faceIndex, { type: face.type, value: face.value + 2 }, 25)
    }
    setActiveAction(null)
    setSelectedDieId(null)
  }

  function handleMergeSelect(dieId: string) {
    if (firstMergeId === null) {
      setFirstMergeId(dieId)
      setMergeError(false)
      return
    }
    if (dieId === firstMergeId) {
      setFirstMergeId(null)
      return
    }
    const die1 = inventory.find((d) => d.id === firstMergeId)
    const die2 = inventory.find((d) => d.id === dieId)
    const jokerMerge = die1?.dieType === 'joker' || die2?.dieType === 'joker'
    const bothJokers = die1?.dieType === 'joker' && die2?.dieType === 'joker'
    if (!die1 || !die2 || bothJokers || (!jokerMerge && die1.dieType !== die2.dieType)) {
      setMergeError(true)
      setTimeout(() => setMergeError(false), 1200)
      return
    }
    shopMergeDice(firstMergeId, dieId, mergeCost)
    setActiveAction(null)
    setFirstMergeId(null)
    setMergeError(false)
  }

  function handleBack() {
    if (activeAction === 'merge' && firstMergeId !== null) {
      setFirstMergeId(null); setMergeError(false)
    } else if (selectedDieId) {
      setSelectedDieId(null)
    } else {
      setActiveAction(null); setFirstMergeId(null)
    }
  }

  const canMerge = gold >= mergeCost &&
    inventory.some((d, i) => inventory.some((d2, j) => {
      if (i >= j) return false
      if (d.dieType === 'joker' && d2.dieType === 'joker') return false
      return d.dieType === d2.dieType || d.dieType === 'joker' || d2.dieType === 'joker'
    }))

  const subheaderText =
    activeAction === null        ? 'Choose a service'                        :
    activeAction === 'merge' && firstMergeId === null ? 'Select first die to merge'      :
    activeAction === 'merge' && firstMergeId !== null ? 'Select an identical die to merge' :
    selectedDieId === null
      ? (activeAction === 'purify' ? 'Select a die to purify'  : 'Select a die to empower')
      : (activeAction === 'purify' ? 'Select a skull face'     : 'Select a face to empower')

  return (
    <div style={{
      maxWidth: 384, margin: '0 auto', height: '100dvh',
      display: 'flex', flexDirection: 'column',
      background: '#0f0f1a', color: '#fff', overflow: 'hidden',
    }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#1a1a2e', padding: '12px 16px',
        borderBottom: '3px solid #000',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Flame size={16} color="#f97316" strokeWidth={2.5} />
            <span style={{
              fontSize: '1.1rem', fontWeight: 700,
              color: '#f97316', textShadow: '2px 2px 0 #7c2d12',
              letterSpacing: '0.1em',
            }}>
              THE FORGE
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Coins size={13} color="#fbbf24" strokeWidth={2.5} />
              <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem' }}>{gold}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Heart size={13} color="#22c55e" strokeWidth={2.5} />
              <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.85rem' }}>
                {player.hp}/{player.maxHp}
              </span>
            </div>
          </div>
        </div>
        {lastGoldEarned > 0 && (
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Coins size={12} color="#fbbf24" strokeWidth={2.5} />
            <span style={{ color: '#fbbf24', fontSize: '0.7rem', fontWeight: 700 }}>
              +{lastGoldEarned} gold from boss victory
            </span>
          </div>
        )}
        {justDefeatedBoss && (
          <div style={{
            marginTop: 8, padding: '8px 12px',
            background: '#1c0533',
            border: '2px solid #9333ea',
            boxShadow: '3px 3px 0 #4c0070',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Skull size={14} color="#c084fc" strokeWidth={2.5} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#e9d5ff', letterSpacing: '0.05em' }}>
              BOSS DEFEATED — A Cursed Die has been added to your bag!
            </span>
          </div>
        )}
      </div>

      {/* ── Sub-header / breadcrumb ────────────────────────────────────────── */}
      <div style={{
        background: '#12121f', padding: '8px 16px',
        borderBottom: '2px solid #000',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {activeAction !== null && (
          <button
            onClick={handleBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, display: 'flex', alignItems: 'center',
            }}
          >
            <ArrowLeft size={14} color="#6b7280" strokeWidth={2.5} />
          </button>
        )}
        <span style={{
          fontSize: '0.6rem', color: '#9ca3af',
          letterSpacing: '0.3em', textTransform: 'uppercase',
        }}>
          {subheaderText}
        </span>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>

        {/* Default view — action cards */}
        {activeAction === null && (
          <>
            <ActionCard
              label="REST"
              cost={healCost}
              description={`Recover 30 HP. You currently have ${player.hp}/${player.maxHp} HP.`}
              disabled={gold < healCost || player.hp >= player.maxHp}
              accentColor="#22c55e"
              onSelect={() => shopHeal(healCost, 30)}
            />
            <ActionCard
              label="PURIFY"
              cost={20}
              description={`Remove a curse. Changes 1 Skull face into a blank Damage face (0 dmg). ${3 - purifyUsesThisShop} use${3 - purifyUsesThisShop === 1 ? '' : 's'} remaining this visit.`}
              disabled={gold < 20 || purifyUsesThisShop >= 3}
              accentColor="#7c3aed"
              buttonLabel={`PURIFY (${3 - purifyUsesThisShop} left)`}
              onSelect={() => { setActiveAction('purify'); setSelectedDieId(null) }}
            />
            <ActionCard
              label="EMPOWER"
              cost={25}
              description="Forge a stronger face. Adds +2 to any Damage or Shield face."
              disabled={gold < 25}
              accentColor="#dc2626"
              onSelect={() => { setActiveAction('empower'); setSelectedDieId(null) }}
            />
            <ActionCard
              label="MERGE"
              cost={mergeCost}
              description="Combine 2 identical dice into 1. All non-skull face values are ×3."
              disabled={!canMerge}
              accentColor="#d97706"
              onSelect={() => { setActiveAction('merge'); setFirstMergeId(null) }}
            />
          </>
        )}

        {/* Die selection view — purify / empower */}
        {(activeAction === 'purify' || activeAction === 'empower') && selectedDieId === null && inventory.map((die) => (
          <DiePickerRow key={die.id} die={die} onClick={() => setSelectedDieId(die.id)} />
        ))}

        {/* Die selection view — merge */}
        {activeAction === 'merge' && (
          <>
            {inventory.map((die) => (
              <DiePickerRow
                key={die.id}
                die={die}
                isHighlighted={die.id === firstMergeId}
                onClick={() => handleMergeSelect(die.id)}
              />
            ))}
            {mergeError && (
              <p style={{
                fontSize: '0.65rem', color: '#ef4444',
                textAlign: 'center', margin: 0, letterSpacing: '0.05em',
              }}>
                Dice must be of the same type to merge
              </p>
            )}
          </>
        )}

        {/* Face selection view — purify / empower */}
        {(activeAction === 'purify' || activeAction === 'empower') && selectedDie !== null && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px',
              background: '#1a1a2e', border: '2px solid #000',
            }}>
              <div style={{
                width: 16, height: 16, flexShrink: 0,
                backgroundColor: dieTypeStyle[selectedDie.dieType].bg,
                border: '2px solid #000',
              }} />
              <span style={{
                fontWeight: 700, fontSize: '0.85rem',
                color: dieTypeStyle[selectedDie.dieType].bg,
              }}>
                {DIE_NAMES[selectedDie.dieType] ?? selectedDie.dieType.toUpperCase()}
              </span>
            </div>
            <FacePickerGrid
              die={selectedDie}
              activeAction={activeAction}
              onFaceSelect={handleFaceSelect}
            />
            <p style={{
              fontSize: '0.65rem', color: '#6b7280',
              textAlign: 'center', margin: 0, letterSpacing: '0.05em',
            }}>
              {activeAction === 'purify'
                ? 'Only skull faces can be purified'
                : 'Only damage and shield faces can be empowered'}
            </p>
          </div>
        )}
      </div>

      {/* ── Leave shop footer ──────────────────────────────────────────────── */}
      {activeAction === null && (
        <div style={{
          padding: '12px 16px', borderTop: '3px solid #000',
          background: '#1a1a2e',
        }}>
          <button
            onClick={leaveShop}
            className="pixel-btn"
            style={{ background: '#374151', color: '#d1d5db' }}
          >
            LEAVE THE FORGE
          </button>
        </div>
      )}
    </div>
  )
}
