import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Activity, Antenna, Film, RadioTower, Shield, Target } from 'lucide-react'
import { useOperationsStore } from '../../store/operationsStore'
import { useScenarioStore } from '../../store/scenarioStore'
import { useSimulationStore } from '../../store/simulationStore'
import { useEntityStore } from '../../store/entityStore'
import { useCountryStore } from '../../store/countryStore'
import { getCountryById } from '../../data/countries'

export function CommandDirectorOverlay() {
  const briefingVisible = useOperationsStore((state) => state.briefingVisible)
  const setBriefingVisible = useOperationsStore((state) => state.setBriefingVisible)
  const broadcast = useOperationsStore((state) => state.broadcastMode)
  const messages = useOperationsStore((state) => state.radioMessages)
  const scenario = useScenarioStore((state) => state.activeScenario)
  const elapsed = useSimulationStore((state) => state.elapsed)
  const isRunning = useSimulationStore((state) => state.isRunning)
  const countryId = useCountryStore((state) => state.selectedCountryId)
  const country = countryId ? getCountryById(countryId) : null
  const entities = useEntityStore((state) => state.entities)
  const attacks = useMemo(() => entities.filter((entity) => entity.kind === 'attack'), [entities])
  const defences = useMemo(() => entities.filter((entity) => entity.kind === 'defence'), [entities])
  const intercepted = attacks.filter((entity) => entity.status === 'intercepted').length
  const impacts = attacks.filter((entity) => entity.status === 'exploded').length
  const latest = messages.at(-1)
  const resumeAfterBriefing = useRef(false)

  const dismissBriefing = useCallback(() => {
    setBriefingVisible(false)
    if (resumeAfterBriefing.current) useSimulationStore.getState().start()
    resumeAfterBriefing.current = false
  }, [setBriefingVisible])

  useEffect(() => {
    if (!briefingVisible) return
    const simulation = useSimulationStore.getState()
    resumeAfterBriefing.current = simulation.isRunning
    if (simulation.isRunning) simulation.pause()
    const timeout = window.setTimeout(dismissBriefing, 5200)
    return () => window.clearTimeout(timeout)
  }, [briefingVisible, dismissBriefing])

  return <>
    {briefingVisible && scenario && <div className="cinematic-briefing" onClick={dismissBriefing}>
      <div className="cinematic-briefing__scan" />
      <div className="cinematic-briefing__content">
        <span className="cinematic-briefing__icon"><Film size={25} /></span>
        <small>Operational directive · {country?.name || 'Global theatre'}</small>
        <h2>{scenario.name}</h2>
        <p>{scenario.description}</p>
        <div><span><Target size={13} />{attacks.length} hostile tracks</span><span><Shield size={13} />{defences.length} defence systems</span><span><Antenna size={13} />C2 network online</span></div>
        <em>Click to enter command</em>
      </div>
    </div>}
    {latest && !briefingVisible && <div className="radio-ticker" data-tone={latest.tone}><RadioTower size={12} /><strong>{latest.speaker}</strong><span>{latest.message}</span><time>T+{latest.time.toFixed(1)}</time></div>}
    {broadcast && !briefingVisible && <div className="broadcast-overlay">
      <div className="broadcast-live"><i />LIVE · SKIES OF CONFLICT</div>
      <div className="broadcast-scorebug"><span><small>STOPPED</small><strong>{intercepted}</strong></span><em>{isRunning ? <Activity size={12} /> : 'AAR'} T+{elapsed.toFixed(1)}</em><span><small>IMPACTS</small><strong>{impacts}</strong></span></div>
      <div className="broadcast-lower-third"><span>{scenario?.name || 'OPEN THEATRE'}</span><small>{country?.name || 'GLOBAL TEST RANGE'} · INTEGRATED AIR-DEFENCE COMMAND</small></div>
    </div>}
  </>
}
