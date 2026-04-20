import { useGameStore } from './store/gameStore'
import { LoadoutScreen } from './components/LoadoutScreen'
import { CombatScreen } from './components/CombatScreen'

function App() {
  const turnPhase = useGameStore((s) => s.turnPhase)
  return turnPhase === 'loadout' ? <LoadoutScreen /> : <CombatScreen />
}

export default App
