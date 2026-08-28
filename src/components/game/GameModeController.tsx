import { useEffect, useRef } from 'react'
import { useEntityStore } from '../../store/entityStore'
import { useGameModeStore } from '../../store/gameModeStore'
import { useReplayStore } from '../../store/replayStore'
import { useSimulationStore } from '../../store/simulationStore'
import { scoreCommanderMatch } from '../../logic/game/matchBuilder'
import { useOperationsStore } from '../../store/operationsStore'

export function GameModeController() {
  const phase = useGameModeStore((state) => state.phase)
  const isRunning = useSimulationStore((state) => state.isRunning)
  const elapsed = useSimulationStore((state) => state.elapsed)
  const entities = useEntityStore((state) => state.entities)
  const interceptors = useEntityStore((state) => state.interceptors)
  const finalized = useRef(false)

  useEffect(() => {
    if (phase === 'battle') finalized.current = false
  }, [phase])

  useEffect(() => {
    if (phase !== 'battle' || isRunning || elapsed <= 0 || finalized.current) return
    const attacks = entities.filter((entity) => entity.kind === 'attack')
    if (attacks.length === 0 || attacks.some((attack) => attack.status === 'active')) return

    finalized.current = true
    const match = useGameModeStore.getState()
    const result = scoreCommanderMatch({
      intercepted: attacks.filter((attack) => attack.status === 'intercepted').length,
      impacts: attacks.filter((attack) => attack.status === 'exploded').length,
      escaped: attacks.filter((attack) => attack.status === 'missed' || attack.status === 'destroyed').length,
      duration: elapsed,
      interceptorsFired: interceptors.length,
      defenceForce: match.defenceForce,
      attackForce: match.attackForce,
      intelLevel: match.intelLevel,
    })
    useReplayStore.getState().stopRecording()
    match.setResult(result)
    match.recordMetaResult(result)
    const dailyDate = match.activeOperationName.startsWith('Daily Directive') ? new Date().toISOString().slice(0, 10) : undefined
    useOperationsStore.getState().recordOutcome(result.winner, result.grade, result.interceptionRate, dailyDate)
    match.setPhase('debrief')
  }, [elapsed, entities, interceptors.length, isRunning, phase])

  return null
}
