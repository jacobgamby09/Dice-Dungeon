import { useState } from 'react'
import { motion } from 'framer-motion'
import { Coins, Heart, Shield, Swords, Skull, Flame, ArrowLeft, Droplets, Star, Shuffle } from 'lucide-react'
import { useGameStore, UNIQUE_DIE_TYPES } from '../store/gameStore'
import { dieTypeStyle, faceColor } from './DieCard'
import type { Die, DieFace } from '../store/gameStore'
import { DiePresentationModal } from './DiePresentationModal'

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

// ── Shop action type ──────────────────────────────────────────────────────────

type ShopAction = 'purify' | 'craft' | 'merge' | null

// ── Craft option generator ────────────────────────────────────────────────────

const CRAFT_TYPES: Array<DieFace['type']> = ['damage', 'shield', 'heal', 'lifesteal']

function generateCraftOptions(mergeLevel: number): DieFace[] {
  const multiplier = Math.pow(3, mergeLevel)
  const shuffled = [...CRAFT_TYPES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3).map((type) => ({
    type,
    value: (Math.floor(Math.random() * 6) + 1) * multiplier,
  }))
}

const FACE_LABELS: Partial<Record<DieFace['type'], string>> = {
  damage:    'Damage',
  shield:    'Shield',
  heal:      'Heal',
  lifesteal: 'Lifesteal',
}

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

function DiePickerRow({
  die, isHighlighted, isHost, allowCursed, onClick,
}: {
  die: Die; isHighlighted?: boolean; isHost?: boolean; allowCursed?: boolean; onClick: () => void
}) {
  const s        = dieTypeStyle[die.dieType]
  const name     = `${DIE_NAMES[die.dieType] ?? die.dieType.toUpperCase()}${UNIQUE_DIE_TYPES.has(die.dieType) ? ' ★' : ''}`
  const level    = die.mergeLevel ?? 0
  const isCursed = die.dieType === 'cursed'
  const disabled = isCursed && !allowCursed

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        background: '#1a1a2e',
        border: `3px solid ${isHighlighted ? '#d97706' : '#000'}`,
        boxShadow: isHighlighted ? '4px 4px 0 #d97706' : '4px 4px 0 #000',
        padding: '10px 14px', width: '100%', color: '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
      }}
    >
      <div style={{
        width: 18, height: 18, flexShrink: 0,
        backgroundColor: s.bg, border: '2px solid #000', boxShadow: `2px 2px 0 ${s.shadow}`,
      }} />
      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: s.bg }}>
        {name}
        {level > 0 && (
          <span style={{ color: '#f59e0b', fontWeight: 900, marginLeft: 4 }}>+{level}</span>
        )}
      </span>
      {die.isCustomized && (
        <span style={{
          fontSize: '0.55rem', fontWeight: 700, color: '#fbbf24',
          border: '1px solid #fbbf24', padding: '1px 5px',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          lineHeight: 1, flexShrink: 0,
        }}>
          CRAFTED
        </span>
      )}
      {disabled
        ? <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: '#ef4444', letterSpacing: '0.1em' }}>CANNOT MERGE</span>
        : isHost
          ? <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: '#d97706', letterSpacing: '0.1em', fontWeight: 700 }}>HOST ✓</span>
          : <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: '#6b7280', letterSpacing: '0.1em' }}>SELECT</span>
      }
    </button>
  )
}

// ── Face picker grid ──────────────────────────────────────────────────────────

function FacePickerGrid({
  die, activeAction, onFaceSelect,
}: {
  die: Die; activeAction: 'purify' | 'craft'
  onFaceSelect: (faceIndex: number, face: DieFace) => void
}) {
  const s = dieTypeStyle[die.dieType]

  function isEligible(face: DieFace) {
    if (activeAction === 'purify') return face.type !== 'blank'
    if (activeAction === 'craft')  return face.type === 'blank' || face.type === 'purified_skull'
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
            {face.type === 'blank' ? (
              <span style={{ fontSize: '0.6rem', color: eligible ? s.text : '#4b5563', letterSpacing: '0.1em' }}>BLANK</span>
            ) : face.type === 'purified_skull' ? (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Skull size={22} color="#ffffff" strokeWidth={2.5} />
                <svg style={{ position: 'absolute', pointerEvents: 'none', zIndex: 10 }} width="28" height="28" viewBox="0 0 28 28">
                  <line x1="2" y1="2" x2="26" y2="26" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                  <line x1="26" y1="2" x2="2" y2="26" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
            ) : face.type === 'skull' ? (
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
    player, gold, inventory,
    shopHeal, shopMergeDice, shopCraftFace, shopPurifyFace, leaveShop,
    purifyUsesThisShop,
  } = useGameStore()
  const unlockedNodes = useGameStore((s) => s.unlockedNodes)
  const healCost  = unlockedNodes.includes('7jutuf9h') ? 5  : 10
  const mergeCost = unlockedNodes.includes('m1hjf9ac') ? 25 : 40

  const [activeAction, setActiveAction]   = useState<ShopAction>(null)
  const [selectedDieId, setSelectedDieId] = useState<string | null>(null)
  const [firstMergeId, setFirstMergeId]   = useState<string | null>(null)
  const [mergeError, setMergeError]       = useState<string | false>(false)
  const [craftOptions, setCraftOptions]   = useState<DieFace[] | null>(null)
  const [craftFaceIndex, setCraftFaceIndex] = useState<number | null>(null)
  const [presentDieId, setPresentDieId]   = useState<string | null>(null)
  const [presentAction, setPresentAction] = useState<'merge' | 'craft' | null>(null)
  const [showPresent, setShowPresent]     = useState(false)
  const [flashVisible, setFlashVisible]   = useState(false)

  const selectedDie = selectedDieId
    ? inventory.find((d) => d.id === selectedDieId) ?? null
    : null

  function handleFaceSelect(faceIndex: number, _face: DieFace) {
    if (!selectedDieId) return
    if (activeAction === 'purify') {
      shopPurifyFace(selectedDieId, faceIndex)
      setActiveAction(null)
      setSelectedDieId(null)
    } else if (activeAction === 'craft') {
      setCraftFaceIndex(faceIndex)
      setCraftOptions(generateCraftOptions(selectedDie?.mergeLevel ?? 0))
    }
  }

  function triggerPresentation(dieId: string, action: 'merge' | 'craft') {
    setPresentDieId(dieId)
    setPresentAction(action)
    setShowPresent(false)
    setFlashVisible(true)
    setTimeout(() => { setFlashVisible(false); setShowPresent(true) }, 500)
  }

  function handleCraftOptionSelect(face: DieFace) {
    if (!selectedDieId || craftFaceIndex === null) return
    shopCraftFace(selectedDieId, craftFaceIndex, face)
    const id = selectedDieId
    setActiveAction(null)
    setSelectedDieId(null)
    setCraftOptions(null)
    setCraftFaceIndex(null)
    triggerPresentation(id, 'craft')
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
    if (!die1 || !die2) return
    if (die1.dieType === 'cursed' || die2.dieType === 'cursed') {
      setMergeError('The Cursed cannot be merged')
      setTimeout(() => setMergeError(false), 1500)
      return
    }
    const level1 = die1.mergeLevel ?? 0
    const level2 = die2.mergeLevel ?? 0
    if (level1 !== level2) {
      setMergeError('Dice must be at the same merge level')
      setTimeout(() => setMergeError(false), 1500)
      return
    }
    const jokerMerge = die1.dieType === 'joker' || die2.dieType === 'joker'
    if (!jokerMerge && die1.dieType !== die2.dieType) {
      setMergeError('Dice must be of the same type to merge')
      setTimeout(() => setMergeError(false), 1500)
      return
    }
    const hostId = firstMergeId
    shopMergeDice(firstMergeId, dieId, mergeCost)
    setActiveAction(null)
    setFirstMergeId(null)
    setMergeError(false)
    triggerPresentation(hostId, 'merge')
  }

  function handleBack() {
    if (activeAction === 'craft' && craftOptions !== null) {
      setCraftOptions(null); setCraftFaceIndex(null)
    } else if (activeAction === 'merge' && firstMergeId !== null) {
      setFirstMergeId(null); setMergeError(false)
    } else if (selectedDieId !== null) {
      setSelectedDieId(null)
    } else {
      setActiveAction(null); setFirstMergeId(null)
      setCraftOptions(null); setCraftFaceIndex(null)
    }
  }

  const canMerge = gold >= mergeCost &&
    inventory.some((d, i) => inventory.some((d2, j) => {
      if (i >= j) return false
      if (d.dieType === 'cursed' || d2.dieType === 'cursed') return false
      const l1 = d.mergeLevel ?? 0
      const l2 = d2.mergeLevel ?? 0
      if (l1 !== l2) return false
      if (d.dieType === 'joker' && d2.dieType === 'joker') return true
      if (d.dieType === 'joker' || d2.dieType === 'joker') return true
      return d.dieType === d2.dieType
    }))

  const canCraft = gold >= 20 &&
    inventory.some((d) => d.faces.some((f) => f.type === 'blank' || f.type === 'purified_skull'))

  const craftEligibleDice = inventory.filter((d) =>
    d.dieType !== 'cursed' &&
    d.faces.some((f) => f.type === 'blank' || f.type === 'purified_skull')
  )

  const subheaderText =
    activeAction === null                                    ? 'Choose a service'               :
    activeAction === 'merge' && firstMergeId === null        ? 'Select first die to merge'      :
    activeAction === 'merge' && firstMergeId !== null        ? 'Select a die to merge with'     :
    activeAction === 'craft' && selectedDieId === null       ? 'Select a die to craft'          :
    activeAction === 'craft' && craftOptions !== null        ? 'Choose your new face'           :
    activeAction === 'craft' && selectedDieId !== null       ? 'Select a face to replace'       :
    selectedDieId === null                                   ? 'Select a die to purify'         :
                                                               'Select a skull face'

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
              cost={10}
              description={`Wipe any face clean, making it blank and available for crafting. ${3 - purifyUsesThisShop} use${3 - purifyUsesThisShop === 1 ? '' : 's'} remaining this visit.`}
              disabled={gold < 10 || purifyUsesThisShop >= 3}
              accentColor="#7c3aed"
              buttonLabel={`PURIFY (${3 - purifyUsesThisShop} left)`}
              onSelect={() => { setActiveAction('purify'); setSelectedDieId(null) }}
            />
            <ActionCard
              label="CRAFT"
              cost={20}
              description="Transform a blank or purified face. Choose from 3 random new face options."
              disabled={!canCraft}
              accentColor="#dc2626"
              onSelect={() => { setActiveAction('craft'); setSelectedDieId(null) }}
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

        {/* Die selection — purify (cursed allowed) */}
        {activeAction === 'purify' && selectedDieId === null && inventory.map((die) => (
          <DiePickerRow key={die.id} die={die} allowCursed onClick={() => setSelectedDieId(die.id)} />
        ))}

        {/* Die selection — craft (only eligible dice, cursed not disabled here either if it has blank faces) */}
        {activeAction === 'craft' && selectedDieId === null && craftOptions === null && (
          <>
            {craftEligibleDice.length === 0
              ? <p style={{ fontSize: '0.65rem', color: '#6b7280', textAlign: 'center', margin: 0 }}>
                  No dice with blank or purified faces to craft
                </p>
              : craftEligibleDice.map((die) => (
                  <DiePickerRow key={die.id} die={die} allowCursed onClick={() => setSelectedDieId(die.id)} />
                ))
            }
          </>
        )}

        {/* Die selection — merge */}
        {activeAction === 'merge' && (
          <>
            {inventory.filter((d) => d.dieType !== 'cursed' && d.dieType !== 'unique').map((die) => (
              <DiePickerRow
                key={die.id}
                die={die}
                isHighlighted={die.id === firstMergeId}
                isHost={die.id === firstMergeId}
                onClick={() => handleMergeSelect(die.id)}
              />
            ))}
            {mergeError && (
              <p style={{
                fontSize: '0.65rem', color: '#ef4444',
                textAlign: 'center', margin: 0, letterSpacing: '0.05em',
              }}>
                {mergeError}
              </p>
            )}
          </>
        )}

        {/* Face selection — purify or craft (before options shown) */}
        {(activeAction === 'purify' || (activeAction === 'craft' && craftOptions === null)) && selectedDie !== null && (
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
              activeAction={activeAction as 'purify' | 'craft'}
              onFaceSelect={handleFaceSelect}
            />
            <p style={{
              fontSize: '0.65rem', color: '#6b7280',
              textAlign: 'center', margin: 0, letterSpacing: '0.05em',
            }}>
              {activeAction === 'purify'
                ? 'Select any face to convert it to blank'
                : 'Select a blank or purified face to overwrite'}
            </p>
          </div>
        )}

        {/* Craft option picker */}
        {activeAction === 'craft' && craftOptions !== null && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{
              fontSize: '0.65rem', color: '#9ca3af',
              textAlign: 'center', margin: 0, letterSpacing: '0.05em',
            }}>
              Pick one face to permanently add to your die
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {craftOptions.map((face, i) => {
                const color = faceColor[face.type]
                return (
                  <button
                    key={i}
                    onClick={() => handleCraftOptionSelect(face)}
                    style={{
                      background: '#1a1a2e',
                      border: '3px solid #000',
                      boxShadow: '3px 3px 0 #000',
                      padding: '18px 8px 14px',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      transition: 'border-color 0.1s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = color)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#000')}
                  >
                    <FaceIcon type={face.type} size={26} />
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color, lineHeight: 1 }}>
                      {face.value}
                    </span>
                    <span style={{
                      fontSize: '0.5rem', color: '#6b7280',
                      textTransform: 'uppercase', letterSpacing: '0.15em',
                    }}>
                      {FACE_LABELS[face.type] ?? face.type}
                    </span>
                  </button>
                )
              })}
            </div>
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

      {/* Flash overlay */}
      {flashVisible && (
        <motion.div
          style={{
            position: 'fixed', inset: 0, zIndex: 48,
            background: presentAction === 'merge' ? 'rgba(251,191,36,0.35)' : 'rgba(220,38,38,0.35)',
            maxWidth: 384, margin: '0 auto', pointerEvents: 'none',
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        />
      )}

      {/* Presentation modal */}
      {showPresent && presentDieId !== null && (() => {
        const die = inventory.find((d) => d.id === presentDieId)
        if (!die || !presentAction) return null
        return (
          <DiePresentationModal
            die={die}
            action={presentAction}
            onClose={() => { setShowPresent(false); setPresentDieId(null); setPresentAction(null) }}
          />
        )
      })()}
    </div>
  )
}
