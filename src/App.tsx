import { useGameStore } from './store/gameStore'
import { LoadoutScreen } from './components/LoadoutScreen'
import { CombatScreen } from './components/CombatScreen'
import { DraftScreen } from './components/DraftScreen'
import { ShopScreen } from './components/ShopScreen'
import { BossRewardModal } from './components/BossRewardModal'
import { RelicRewardModal } from './components/RelicRewardModal'
import { InterActScreen } from './components/InterActScreen'
import { ActIntroModal } from './components/ActIntroModal'

function App() {
  const turnPhase = useGameStore((s) => s.turnPhase)
  const showBossRewardModal = useGameStore((s) => s.showBossRewardModal)
  const showRelicRewardModal = useGameStore((s) => s.showRelicRewardModal)
  const showGameOver = useGameStore((s) => s.showGameOver)
  const showActIntroModal = useGameStore((s) => s.showActIntroModal)

  let screen: React.ReactNode
  if (turnPhase === 'loadout')        screen = <LoadoutScreen />
  else if (turnPhase === 'draft')     screen = <DraftScreen />
  else if (turnPhase === 'shop')      screen = <ShopScreen />
  else if (turnPhase === 'inter_act_cull') screen = <InterActScreen />
  else screen = <CombatScreen />

  return (
    <>
      {screen}
      {showBossRewardModal && <BossRewardModal />}
      {showRelicRewardModal && <RelicRewardModal />}
      {showActIntroModal && <ActIntroModal />}
      {showGameOver && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          maxWidth: 384, margin: '0 auto',
          background: 'rgba(0,0,0,0.92)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          <span style={{
            fontSize: '3rem', fontWeight: 900, color: '#ef4444',
            textShadow: '3px 3px 0 #7f1d1d',
            letterSpacing: '0.1em',
          }}>
            YOU DIED
          </span>
          <span style={{
            fontSize: '1rem', color: '#f87171',
            textShadow: '1px 1px 0 #000',
          }}>
            You lost all your Souls!
          </span>
          <button
            onClick={() => useGameStore.setState({ showGameOver: false })}
            className="pixel-btn"
            style={{ marginTop: 8, background: '#7f1d1d', padding: '12px 32px', fontSize: '1rem' }}
          >
            CONTINUE
          </button>
        </div>
      )}
    </>
  )
}

export default App
