import { X, Swords, Shield, Heart, Skull, Coins, Droplets, Star, Shuffle } from 'lucide-react'
import { DIE_TEMPLATES, UNIQUE_DIE_TYPES, DIE_NAMES } from '../store/gameStore'
import type { DieType, DieFace } from '../store/gameStore'
import { dieTypeStyle, faceColor } from './DieCard'

const LIBRARY_TYPES: DieType[] = ['white', 'blue', 'green', 'cursed', 'heavy', 'paladin', 'gambler', 'scavenger', 'wall', 'jackpot', 'vampire', 'priest', 'fortune_teller', 'joker', 'unique', 'blight']

function FaceIcon({ type, size = 11 }: { type: DieFace['type']; size?: number }) {
  const color = faceColor[type]
  if (type === 'damage')    return <Swords   size={size} color={color} strokeWidth={2.5} />
  if (type === 'shield')    return <Shield   size={size} color={color} strokeWidth={2.5} />
  if (type === 'skull')     return <Skull    size={size} color={color} strokeWidth={2.5} />
  if (type === 'gold')      return <Coins    size={size} color={color} strokeWidth={2.5} />
  if (type === 'lifesteal')   return <Droplets size={size} color={color} strokeWidth={2.5} />
  if (type === 'choose_next') return <Star     size={size} color={color} strokeWidth={2.5} />
  if (type === 'wildcard')    return <Shuffle  size={size} color={color} strokeWidth={2.5} />
  return <Heart size={size} color={color} strokeWidth={2.5} />
}

export function DiceLibrary({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 40,
      maxWidth: 384, margin: '0 auto',
      display: 'flex', flexDirection: 'column',
      background: '#0a0a14',
    }}>
      {/* Header */}
      <div style={{
        background: '#1a1a2e', padding: '12px 16px',
        borderBottom: '3px solid #000',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#d1d5db', letterSpacing: '0.15em' }}>
          ✦ DICE LIBRARY
        </span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {LIBRARY_TYPES.map((type) => {
          const template = DIE_TEMPLATES[type]
          const s = dieTypeStyle[type]
          return (
            <div
              key={type}
              style={{
                background: '#12121f',
                border: '3px solid #000',
                boxShadow: `4px 4px 0 ${s.shadow}`,
                padding: '10px 12px',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}
            >
              {/* Die header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 16, height: 16, flexShrink: 0,
                  background: s.bg, border: '2px solid #000',
                  boxShadow: `2px 2px 0 ${s.shadow}`,
                }} />
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: s.bg, flex: 1 }}>
                  {DIE_NAMES[type]}{UNIQUE_DIE_TYPES.has(type) ? ' ★' : ''}
                </span>
                <span style={{
                  fontSize: '0.55rem', color: '#6b7280',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  {template.sides}d
                </span>
              </div>

              {/* 6 faces in a row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
                {template.faces.map((face, i) => (
                  <div
                    key={i}
                    style={{
                      background: s.bg,
                      border: '2px solid #000',
                      boxShadow: `2px 2px 0 ${s.shadow}`,
                      padding: '6px 2px',
                      minHeight: 36,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 2,
                    }}
                  >
                    {face.type === 'blank' ? null
                      : face.type === 'multiplier' ? (
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: s.text, lineHeight: 1 }}>
                          ×{face.value}
                        </span>
                      ) : (face.type === 'skull' || face.type === 'purified_skull' || face.type === 'choose_next' || face.type === 'wildcard') ? (
                        <FaceIcon type={face.type} size={14} />
                      ) : (
                        <>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: s.text, lineHeight: 1 }}>
                            {face.value}
                          </span>
                          <FaceIcon type={face.type} size={10} />
                        </>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ background: '#1a1a2e', padding: '12px 16px', borderTop: '3px solid #000', flexShrink: 0 }}>
        <button onClick={onClose} className="pixel-btn" style={{ background: '#374151' }}>
          CLOSE
        </button>
      </div>
    </div>
  )
}
