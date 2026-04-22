import { useGameStore } from './store/gameStore'
import { LoadoutScreen } from './components/LoadoutScreen'
import { CombatScreen } from './components/CombatScreen'
import { DraftScreen } from './components/DraftScreen'
import { ShopScreen } from './components/ShopScreen'

function App() {
  const turnPhase = useGameStore((s) => s.turnPhase)
  if (turnPhase === 'loadout') return <LoadoutScreen />
  if (turnPhase === 'draft')   return <DraftScreen />
  if (turnPhase === 'shop')    return <ShopScreen />
  return <CombatScreen />
}

export default App
