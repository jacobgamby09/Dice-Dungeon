import { useGameStore } from './store/gameStore'
import { LoadoutScreen } from './components/LoadoutScreen'
import { CombatScreen } from './components/CombatScreen'
import { DraftScreen } from './components/DraftScreen'
import { ShopScreen } from './components/ShopScreen'
import { BossRewardModal } from './components/BossRewardModal'

function App() {
  const turnPhase = useGameStore((s) => s.turnPhase)
  const showBossRewardModal = useGameStore((s) => s.showBossRewardModal)

  let screen: React.ReactNode
  if (turnPhase === 'loadout') screen = <LoadoutScreen />
  else if (turnPhase === 'draft') screen = <DraftScreen />
  else if (turnPhase === 'shop')  screen = <ShopScreen />
  else screen = <CombatScreen />

  return (
    <>
      {screen}
      {showBossRewardModal && <BossRewardModal />}
    </>
  )
}

export default App
