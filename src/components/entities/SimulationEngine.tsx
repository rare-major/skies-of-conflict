import { useSimulationLoop } from '../../hooks/useSimulationLoop'
import { useReplaySystem } from '../../hooks/useReplaySystem'

export function SimulationEngine() {
  useSimulationLoop()
  useReplaySystem()
  return null
}
