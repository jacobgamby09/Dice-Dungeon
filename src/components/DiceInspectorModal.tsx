import { useState } from 'react'
import { X, Swords, Shield, Heart, Skull, Flame, Droplets, Star, Shuffle } from 'lucide-react'
import type { DieType, DieFace, Die } from '../store/gameStore'
import { DIE_TEMPLATES, UNIQUE_DIE_TYPES, DIE_NAMES } from '../store/gameStore'
import { dieTypeStyle, faceColor } from './DieCard'

function dieName(t: DieType) { return `${DIE_NAMES[t]}${UNIQUE_DIE_TYPES.has(t) ? ' ★' : ''}` }

function FaceIcon({ type, size = 13 }: { type: DieFace['type']; size?: number }) {
  const color = faceColor[type]
  if (type === 'damage')    return <Swords   size={size} color={color} strokeWidth={2.5} />
  if (type === 'shield')    return <Shield   size={size} color={color} strokeWidth={2.5} />
  if (type === 'skull')     return <Skull    size={size} color='#ffffff' strokeWidth={2.5} />
  if (type === 'souls')     return <Flame    size={size} color={color} strokeWidth={2.5} />
  if (type === 'lifesteal')   return <Droplets size={size} color={color} strokeWidth={2.5} />
  if (type === 'choose_next') return <Star     size={size} color={color} strokeWidth={2.5} />
  if (type === 'wildcard')    return <Shuffle  size={size} color={color} strokeWidth={2.5} />
  return <Heart size={size} color={color} strokeWidth={2.5} />
}

interface Props {
  types: DieType[]
  initialType?: DieType
  mergeLevel?: number
  faces?: DieFace[]
  dieLookup?: Partial<Record<DieType, Die>>
  onClose: () => void
}

export function DiceInspectorModal({ types, initialType, mergeLevel, faces, dieLookup, onClose }: Props) {
  const [selected, setSelected] = useState<DieType>(initialType ?? types[0])
  const template = DIE_TEMPLATES[selected]
  const instance = dieLookup?.[selected]
  const displayFaces = instance?.faces ?? faces ?? template.faces
  const displayMergeLevel = instance?.mergeLevel ?? mergeLevel
  const s = dieTypeStyle[selected]

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.82)',
        zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1a1a2e',
          border: '3px solid #000',
          boxShadow: '5px 5px 0 #000',
          padding: '16px',
          maxWidth: 320, width: '90%',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{
            fontSize: '0.6rem', color: '#9ca3af',
            letterSpacing: '0.3em', textTransform: 'uppercase',
          }}>
            Dice Inspector
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, lineHeight: 0 }}
          >
            <X size={16} color="#9ca3af" />
          </button>
        </div>

        {/* Type tabs */}
        {types.length > 1 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {types.map((t) => {
              const ts = dieTypeStyle[t]
              const active = t === selected
              return (
                <button
                  key={t}
                  onClick={() => setSelected(t)}
                  style={{
                    flex: 1,
                    background: active ? ts.bg : '#0f0f1a',
                    color: active ? ts.text : '#6b7280',
                    border: `2px solid ${active ? ts.shadow : '#374151'}`,
                    boxShadow: active ? `2px 2px 0 ${ts.shadow}` : 'none',
                    padding: '5px 0',
                    fontSize: '0.6rem', letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
                    minWidth: 48,
                  }}
                >
                  {dieName(t)}
                </button>
              )
            })}
          </div>
        )}

        {/* Die badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 10px', marginBottom: 12,
          background: '#0f0f1a',
          border: `2px solid ${s.shadow}`,
        }}>
          <div style={{
            width: 14, height: 14,
            background: s.bg, border: '2px solid #000',
            boxShadow: `2px 2px 0 ${s.shadow}`, flexShrink: 0,
          }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: s.bg }}>
            {dieName(selected)}
            {(displayMergeLevel ?? 0) > 0 && (
              <span style={{ color: '#f59e0b', fontWeight: 900, marginLeft: 5 }}>+{displayMergeLevel}</span>
            )}
          </span>
          <span style={{ fontSize: '0.6rem', color: '#6b7280', marginLeft: 'auto' }}>
            {template.sides} sides
          </span>
        </div>

        {/* Faces grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8, marginBottom: 16,
        }}>
          {displayFaces.map((face, i) => (
            <div
              key={i}
              style={{
                background: s.bg,
                border: '3px solid #000',
                boxShadow: `3px 3px 0 ${s.shadow}`,
                padding: '10px 4px',
                minHeight: 56,
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}
            >
              {face.type === 'blank' ? null
              : face.type === 'multiplier' ? (
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: s.text, lineHeight: 1 }}>
                  ×{face.value}
                </span>
              ) : face.type === 'purified_skull' ? (
                <>
                  <Skull size={22} color="#ffffff" strokeWidth={2.5} />
                  <svg style={{ position: 'absolute', pointerEvents: 'none', zIndex: 10 }} width="28" height="28" viewBox="0 0 28 28">
                    <line x1="2" y1="2" x2="26" y2="26" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                    <line x1="26" y1="2" x2="2" y2="26" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </>
              ) : (face.type === 'skull' || face.type === 'wildcard' || face.type === 'choose_next') ? (
                <FaceIcon type={face.type} size={22} />
              ) : (
                <>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: s.text, lineHeight: 1 }}>
                    {face.value}
                  </span>
                  <FaceIcon type={face.type} size={14} />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="pixel-btn"
          style={{ background: '#374151' }}
        >
          CLOSE
        </button>
      </div>
    </div>
  )
}
