import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  ChevronRight,
  Clock3,
  Crosshair,
  Eye,
  FileLock2,
  Gauge,
  Minus,
  Plus,
  RadioTower,
  RotateCcw,
  Save,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Users,
  Waves,
  Map,
  Clipboard,
  Upload,
} from 'lucide-react'
import { ATTACK_CATALOG, DEFENCE_CATALOG, GAME_MODES, INTEL_COSTS, MODE_OPERATIONS } from '../../data/gameModes'
import { COUNTRIES } from '../../data/countries'
import { buildCommanderScenario, buildModeOperationScenario, forceCost, forceUnits } from '../../logic/game/matchBuilder'
import { useGameModeStore } from '../../store/gameModeStore'
import { useCountryStore } from '../../store/countryStore'
import { useEntitySpawner } from '../../hooks/useEntitySpawner'
import { useSimulationStore } from '../../store/simulationStore'
import { useReplayStore } from '../../store/replayStore'
import { useScenarioStore } from '../../store/scenarioStore'
import { useEntityStore } from '../../store/entityStore'
import { useOperationsStore } from '../../store/operationsStore'
import type { ForceCatalogItem, ForceSide, IntelLevel, ModeOperation, SavedMatchPlan } from '../../types/game'

interface GameModePanelProps {
  onBattleLaunched?: () => void
}

export function GameModePanel({ onBattleLaunched }: GameModePanelProps) {
  const store = useGameModeStore()
  const { loadScenario } = useEntitySpawner()
  const [planName, setPlanName] = useState('')
  const replayFrames = useReplayStore((state) => state.frames)

  const deployMatch = () => {
    const current = useGameModeStore.getState()
    const scenario = buildCommanderScenario(
      current.activeOperationName,
      current.rules,
      current.defenceForce,
      current.attackForce,
      current.defenceDoctrine,
      current.attackDoctrine,
    )
    useCountryStore.getState().setCountry(current.rules.countryId)
    loadScenario(scenario)
    useScenarioStore.getState().setActiveScenario(scenario)
    useReplayStore.getState().startRecording()
    current.setResult(null)
    current.setPhase('battle')
    useSimulationStore.getState().setTimeScale(1)
    useSimulationStore.getState().start()
    onBattleLaunched?.()
  }

  const deployOperation = (operation: ModeOperation) => {
    const current = useGameModeStore.getState()
    const operationWithDoctrine = operation.mode === 'puzzle'
      ? { ...operation, defenceDoctrine: current.defenceDoctrine }
      : operation
    const seed = current.rules.seed + MODE_OPERATIONS.findIndex((candidate) => candidate.id === operation.id) * 101
    const scenario = buildModeOperationScenario(operationWithDoctrine, seed)
    const defenceSpend = forceCost(operation.defenceForce, 'defence')
    const attackSpend = forceCost(operation.attackForce, 'attack')
    current.setOperationName(operation.name)
    current.setForces(operation.defenceForce, operation.attackForce)
    current.setDefenceDoctrine(operationWithDoctrine.defenceDoctrine)
    current.setAttackDoctrine(operation.attackDoctrine)
    current.setIntelLevel('none')
    current.setRules({ countryId: operation.countryId, seed, defenderBudget: defenceSpend, attackerBudget: attackSpend, maxDefenceUnits: 30, maxAttackUnits: 40 })
    useCountryStore.getState().setCountry(operation.countryId)
    loadScenario(scenario)
    useScenarioStore.getState().setActiveScenario(scenario)
    useReplayStore.getState().startRecording()
    current.setResult(null)
    current.setPhase('battle')
    useSimulationStore.getState().setTimeScale(1)
    useSimulationStore.getState().start()
    onBattleLaunched?.()
  }

  const resetWarRoom = () => {
    useSimulationStore.getState().reset()
    useSimulationStore.getState().setInitialSnapshot(null)
    useEntityStore.getState().clearAll()
    useReplayStore.getState().clear()
    useScenarioStore.getState().setActiveScenario(null)
    store.resetMatch()
  }

  if (store.phase === 'mode-select') {
    return <ModeSelect />
  }

  const isHeadToHead = store.selectedMode === 'duel' || store.selectedMode === 'tournament' || store.selectedMode === 'async'
  if (!isHeadToHead && store.phase !== 'battle' && store.phase !== 'debrief') {
    return <ModeOperationsPanel onDeploy={deployOperation} />
  }

  if (store.phase === 'briefing') {
    if (store.selectedMode === 'tournament') return <TournamentLobby />
    if (store.selectedMode === 'async') return <AsyncLobby />
    return <Briefing />
  }

  if (store.phase === 'defender-setup') {
    return <ForceSetup side="defence" />
  }

  if (store.phase === 'defender-handoff') {
    return (
      <Handoff
        eyebrow="Defence plan encrypted"
        title="Pass command to the attacker"
        description="The defensive deployment is sealed. The next commander will only receive intelligence permitted by their reconnaissance package."
        action="Begin attack planning"
        onContinue={() => store.setPhase('attacker-setup')}
      />
    )
  }

  if (store.phase === 'attacker-setup') {
    return <ForceSetup side="attack" />
  }

  if (store.phase === 'final-lock') {
    const defenceSpend = forceCost(store.defenceForce, 'defence')
    const attackSpend = forceCost(store.attackForce, 'attack') + INTEL_COSTS[store.intelLevel]
    return (
      <div className="game-panel-stack">
        <GameHeading eyebrow="Plans committed" title="Final authorization" icon={FileLock2} />
        <div className="command-lock-card">
          <span className="command-lock-card__seal"><Swords size={23} /></span>
          <div>
            <small>Operation</small>
            <h3>{store.activeOperationName}</h3>
            <p>Both commanders have locked their orders. The deterministic combat seed is <strong>{store.rules.seed}</strong>.</p>
          </div>
        </div>
        <div className="versus-summary-grid">
          <PlanSummary side="Defender" units={forceUnits(store.defenceForce)} spend={defenceSpend} budget={store.rules.defenderBudget} doctrine={store.defenceDoctrine.formation} />
          <span className="versus-summary-grid__mark">VS</span>
          <PlanSummary side="Attacker" units={forceUnits(store.attackForce)} spend={attackSpend} budget={store.rules.attackerBudget} doctrine={store.attackDoctrine.formation} />
        </div>
        <div className="game-action-row">
          <button className="game-button game-button--ghost" onClick={() => store.setPhase('attacker-setup')}><ArrowLeft size={13} /> Revise attack</button>
          <button className="game-button game-button--primary" onClick={deployMatch}><Sparkles size={14} /> Simulate battle</button>
        </div>
      </div>
    )
  }

  if (store.phase === 'battle') {
    return (
      <div className="game-panel-stack">
        <GameHeading eyebrow="Engagement underway" title={store.activeOperationName} icon={RadioTower} />
        <div className="battle-live-card">
          <span className="battle-live-card__pulse" />
          <div><strong>Plans are resolving</strong><p>The command panel has switched to live simulation controls. Return here when the engagement is complete.</p></div>
        </div>
        <button className="game-button game-button--primary" onClick={onBattleLaunched}><Gauge size={14} /> Open battle controls</button>
      </div>
    )
  }

  if (store.phase === 'debrief' && store.result) {
    const result = store.result
    const replayEvents = replayFrames.flatMap((frame) => frame.events).filter((event) => event.type !== 'spawn')
    const winnerLabel = result.winner === 'draw' ? 'Operational draw' : result.winner === 'defence' ? 'Defender victory' : 'Attacker victory'
    return (
      <div className="game-panel-stack">
        <GameHeading eyebrow="After-action report" title={winnerLabel} icon={Trophy} />
        <div className={`debrief-hero debrief-hero--${result.winner}`}>
          <span className="debrief-grade">{result.grade}</span>
          <div><small>Final assessment</small><h3>{result.interceptionRate}% interception rate</h3><p>{result.intercepted} stopped · {result.impacts} impacts · {result.escaped} escaped</p></div>
        </div>
        <div className="scoreboard">
          <Score side="Defender" score={result.defenderScore} tone="green" />
          <span>:</span>
          <Score side="Attacker" score={result.attackerScore} tone="red" />
        </div>
        <div className="aar-grid">
          <AarMetric label="Engagement" value={`${result.duration.toFixed(1)}s`} icon={Clock3} />
          <AarMetric label="Interceptors" value={result.interceptorsFired.toString()} icon={Crosshair} />
          <AarMetric label="Defence spend" value={result.defenderSpend.toString()} icon={Shield} />
          <AarMetric label="Attack spend" value={result.attackerSpend.toString()} icon={Target} />
        </div>
        <div className="aar-insight">
          <Eye size={14} />
          <div><strong>Command intelligence</strong><p>{result.impacts > 0 ? 'The strike package created a penetration window. Review the replay for saturation and radar coverage gaps.' : 'The defensive layers denied every terminal approach. Review interceptor economy and engagement timing in replay.'}</p></div>
        </div>
        {replayEvents.length > 0 && <EventTimeline events={replayEvents.slice(-6)} />}
        <div className="save-plan-row">
          <input value={planName} onChange={(event) => setPlanName(event.target.value)} placeholder="Save command plan…" />
          <button onClick={() => { store.savePlan(planName); setPlanName('') }} aria-label="Save command plan"><Save size={13} /></button>
        </div>
        <button className="game-button game-button--ghost" onClick={onBattleLaunched}><RadioTower size={13} /> Open cinematic replay controls</button>
        <div className="game-action-row">
          <button className="game-button game-button--ghost" onClick={() => { store.setPhase('final-lock'); useSimulationStore.getState().reset() }}><RotateCcw size={13} /> Run again</button>
          <button className="game-button game-button--primary" onClick={resetWarRoom}>New operation <ArrowRight size={13} /></button>
        </div>
      </div>
    )
  }

  return null
}

function ModeSelect() {
  const selectMode = useGameModeStore((state) => state.selectMode)
  const savedPlans = useGameModeStore((state) => state.savedPlans)
  const loadPlan = useGameModeStore((state) => state.loadPlan)
  return (
    <div className="game-panel-stack">
      <GameHeading eyebrow="War room" title="Game modes" icon={Swords} />
      <p className="game-intro">Choose a command format. Every mode uses the same equipment economy, doctrine system and cinematic combat engine.</p>
      <div className="mode-card-list">
        {GAME_MODES.map((mode) => (
          <button key={mode.id} className={`mode-card mode-card--${mode.status}`} onClick={() => selectMode(mode.id)}>
            <span className="mode-card__icon">{mode.id === 'duel' ? <Users size={17} /> : mode.id === 'survival' ? <Shield size={17} /> : <Bot size={17} />}</span>
            <div><small>{mode.eyebrow}</small><strong>{mode.name}</strong><p>{mode.description}</p></div>
            <span className="mode-card__meta">{mode.players}<ChevronRight size={13} /></span>
          </button>
        ))}
      </div>
      {savedPlans.length > 0 && (
        <div className="saved-plan-list">
          <span className="game-section-label">Saved command packages</span>
          {savedPlans.slice(0, 3).map((plan) => (
            <button key={plan.id} onClick={() => loadPlan(plan.id)}><FileLock2 size={12} /><span>{plan.name}</span><small>{new Date(plan.createdAt).toLocaleDateString()}</small></button>
          ))}
        </div>
      )}
    </div>
  )
}

function ModeOperationsPanel({ onDeploy }: { onDeploy: (operation: ModeOperation) => void }) {
  const store = useGameModeStore()
  const activeCampaignId = useOperationsStore((state) => state.activeCampaignId)
  const operations = MODE_OPERATIONS.filter((operation) => operation.mode === store.selectedMode && (operation.mode !== 'campaign' || operation.campaignId === activeCampaignId))
  const [selectedId, setSelectedId] = useState(operations[0]?.id || '')
  const selected = operations.find((operation) => operation.id === selectedId) || operations[0]
  const mode = GAME_MODES.find((candidate) => candidate.id === store.selectedMode)

  const selectOperation = (operation: ModeOperation) => {
    setSelectedId(operation.id)
    store.setDefenceDoctrine(operation.defenceDoctrine)
  }

  return (
    <div className="game-panel-stack">
      <GameHeading eyebrow={mode?.eyebrow || 'Game mode'} title={mode?.name || 'Command mode'} icon={store.selectedMode === 'survival' ? Waves : Map} />
      {store.selectedMode === 'campaign' && (
        <><div className="campaign-strip"><span><strong>{store.campaign.credits}</strong> command credits</span><span><strong>{store.campaign.readiness}%</strong> readiness</span><span><strong>{store.campaign.territory}%</strong> territory held</span></div><div className="campaign-logistics"><span>INTEL {store.campaign.intelligence}%</span><i><b style={{ width: `${store.campaign.intelligence}%` }} /></i><span>{store.campaign.cumulativeLosses} persistent losses</span></div></>
      )}
      {store.selectedMode === 'coop' && (
        <div className="coop-role-grid"><div><RadioTower size={14} /><strong>Player one</strong><span>Radar + outer layer</span></div><div><Shield size={14} /><strong>Player two</strong><span>Inner + terminal layer</span></div></div>
      )}
      <div className="operation-list">
        {operations.map((operation, index) => {
          const locked = operation.mode === 'campaign' && index > store.campaign.unlockedOperation
          return (
            <button key={operation.id} disabled={locked} className={selected?.id === operation.id ? 'is-active' : ''} onClick={() => selectOperation(operation)}>
              <span>{operation.difficulty}</span><strong>{operation.name}</strong><p>{locked ? 'Complete the previous operation to unlock.' : operation.description}</p><small>{forceUnits(operation.attackForce)} threats · {forceUnits(operation.defenceForce)} systems</small>
            </button>
          )
        })}
      </div>
      {selected && store.selectedMode === 'puzzle' && <DefenceDoctrineEditor />}
      {selected && store.selectedMode === 'survival' && (
        <div className="wave-preview"><Waves size={14} /><div><strong>Escalation sequence</strong><p>Recon wave → saturation wave → precision wave → strategic finish</p></div></div>
      )}
      <div className="game-action-row">
        <button className="game-button game-button--ghost" onClick={store.resetMatch}><ArrowLeft size={13} /> Modes</button>
        <button className="game-button game-button--primary" disabled={!selected} onClick={() => selected && onDeploy(selected)}><Sparkles size={13} /> Begin operation</button>
      </div>
    </div>
  )
}

function TournamentLobby() {
  const store = useGameModeStore()
  const start = () => {
    store.setRules({ countryId: 'usa', defenderBudget: 900, attackerBudget: 900, maxDefenceUnits: 10, maxAttackUnits: 12, seed: 77000 + store.tournament.round * 137 })
    store.setOperationName(`War Games · Round ${store.tournament.round}`)
    store.setPhase('defender-setup')
  }
  return <div className="game-panel-stack"><GameHeading eyebrow="Competitive bracket" title="War Games" icon={Trophy} /><div className="tournament-score"><Score side="Defender wins" score={store.tournament.defenderWins} tone="green"/><span>ROUND {store.tournament.round}</span><Score side="Attacker wins" score={store.tournament.attackerWins} tone="red"/></div><div className="briefing-note"><FileLock2 size={14}/><p>Fixed 900-point budgets, restricted unit counts and a published deterministic seed make every round reproducible.</p></div><div className="game-action-row"><button className="game-button game-button--ghost" onClick={store.resetMatch}><ArrowLeft size={13}/> Modes</button><button className="game-button game-button--primary" onClick={start}>Start round <ArrowRight size={13}/></button></div></div>
}

function AsyncLobby() {
  const store = useGameModeStore()
  const [commandCode, setCommandCode] = useState('')
  const [status, setStatus] = useState('')

  const exportPlan = (plan: SavedMatchPlan) => {
    setCommandCode(encodeCommandPlan(plan))
    setStatus('Command package generated. Copy it to the other player.')
  }

  const importPlan = () => {
    try {
      const plan = decodeCommandPlan(commandCode)
      useGameModeStore.setState({
        selectedMode: 'async', phase: 'final-lock', activeOperationName: plan.name, rules: plan.rules,
        defenceForce: plan.defenceForce, attackForce: plan.attackForce, defenceDoctrine: plan.defenceDoctrine,
        attackDoctrine: plan.attackDoctrine, intelLevel: plan.intelLevel, result: null,
      })
      setStatus('Command package authenticated and ready to resolve.')
    } catch {
      setStatus('That command package is invalid or incomplete.')
    }
  }

  return <div className="game-panel-stack"><GameHeading eyebrow="Asynchronous plans" title="Dead Drop" icon={FileLock2}/><p className="game-intro">Create a plan now, or paste a command package received from another player. Packages contain plans and rules—not account data.</p><textarea className="command-code" value={commandCode} onChange={(event) => setCommandCode(event.target.value)} placeholder="Paste command package…"/>{status && <div className="command-code-status">{status}</div>}<div className="async-actions"><button onClick={importPlan}><Upload size={12}/> Import package</button>{store.savedPlans[0] && <button onClick={() => exportPlan(store.savedPlans[0])}><Clipboard size={12}/> Export latest saved plan</button>}</div>{store.savedPlans.length > 0 && <div className="saved-plan-list"><span className="game-section-label">Local command packages</span>{store.savedPlans.slice(0,3).map((plan)=><button key={plan.id} onClick={()=>exportPlan(plan)}><FileLock2 size={12}/><span>{plan.name}</span><small>Generate code</small></button>)}</div>}<div className="game-action-row"><button className="game-button game-button--ghost" onClick={store.resetMatch}><ArrowLeft size={13}/> Modes</button><button className="game-button game-button--primary" onClick={()=>store.setPhase('defender-setup')}>Create new package <ArrowRight size={13}/></button></div></div>
}

function encodeCommandPlan(plan: SavedMatchPlan): string {
  const bytes = new TextEncoder().encode(JSON.stringify(plan))
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return `SKY1-${btoa(binary)}`
}

function decodeCommandPlan(code: string): SavedMatchPlan {
  const encoded = code.trim().replace(/^SKY1-/, '')
  const binary = atob(encoded)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  const plan = JSON.parse(new TextDecoder().decode(bytes)) as SavedMatchPlan
  if (!plan.rules || !Array.isArray(plan.attackForce) || !Array.isArray(plan.defenceForce)) throw new Error('Invalid plan')
  return plan
}

function Briefing() {
  const store = useGameModeStore()
  return (
    <div className="game-panel-stack">
      <GameHeading eyebrow="Commander vs Commander" title="Mission briefing" icon={Swords} />
      <label className="game-field"><span>Operation name</span><input value={store.activeOperationName} onChange={(event) => store.setOperationName(event.target.value)} /></label>
      <div>
        <span className="game-section-label">Theatre</span>
        <div className="theatre-choice-grid">
          {COUNTRIES.slice(0, 6).map((country) => <button key={country.id} className={store.rules.countryId === country.id ? 'is-active' : ''} onClick={() => store.setRules({ countryId: country.id })}>{country.name}</button>)}
        </div>
      </div>
      <div className="briefing-grid">
        <label className="game-field"><span>Budget per side</span><select value={store.rules.attackerBudget} onChange={(event) => store.setRules({ attackerBudget: Number(event.target.value), defenderBudget: Number(event.target.value) })}><option value={900}>900 · Skirmish</option><option value={1200}>1200 · Standard</option><option value={1600}>1600 · Grand battle</option></select></label>
        <label className="game-field"><span>Objective</span><select value={store.rules.objective} onChange={(event) => store.setRules({ objective: event.target.value as typeof store.rules.objective })}><option value="capital">Capital district</option><option value="airbase">Strategic airbase</option><option value="command-node">Command node</option></select></label>
      </div>
      <label className="game-field"><span>Competitive seed</span><input type="number" value={store.rules.seed} onChange={(event) => store.setRules({ seed: Number(event.target.value) || 1 })} /></label>
      <div className="briefing-note"><FileLock2 size={14} /><p>Plans remain hidden between setup phases. The seed makes every probability roll reproducible for rematches and tournament play.</p></div>
      <div className="game-action-row"><button className="game-button game-button--ghost" onClick={store.resetMatch}><ArrowLeft size={13} /> Modes</button><button className="game-button game-button--primary" onClick={() => store.setPhase('defender-setup')}>Seat defender <ArrowRight size={13} /></button></div>
    </div>
  )
}

function ForceSetup({ side }: { side: ForceSide }) {
  const store = useGameModeStore()
  const isAttack = side === 'attack'
  const force = isAttack ? store.attackForce : store.defenceForce
  const catalog = isAttack ? ATTACK_CATALOG : DEFENCE_CATALOG
  const baseBudget = isAttack ? store.rules.attackerBudget : store.rules.defenderBudget
  const intelCost = isAttack ? INTEL_COSTS[store.intelLevel] : 0
  const spend = forceCost(force, side) + intelCost
  const budget = baseBudget
  const units = forceUnits(force)
  const maxUnits = isAttack ? store.rules.maxAttackUnits : store.rules.maxDefenceUnits
  const canCommit = units > 0 && spend <= budget

  const updateCount = (asset: ForceCatalogItem, delta: number) => {
    const current = force.find((selection) => selection.assetId === asset.id)?.count || 0
    const next = Math.max(0, Math.min(asset.maxCount, current + delta))
    const nextSpend = spend + (next - current) * asset.cost
    const nextUnits = units + next - current
    if (nextSpend > budget || nextUnits > maxUnits) return
    store.setForceCount(side, asset.id, next)
  }

  return (
    <div className="game-panel-stack">
      <GameHeading eyebrow={isAttack ? 'Player two · secret phase' : 'Player one · secret phase'} title={isAttack ? 'Build strike package' : 'Build defence network'} icon={isAttack ? Target : Shield} />
      <BudgetMeter spend={spend} budget={budget} units={units} maxUnits={maxUnits} />
      {isAttack && <IntelPicker />}
      <div className="force-catalog">
        {catalog.map((asset) => {
          const count = force.find((selection) => selection.assetId === asset.id)?.count || 0
          return <CatalogStep key={asset.id} asset={asset} count={count} onMinus={() => updateCount(asset, -1)} onPlus={() => updateCount(asset, 1)} disabledPlus={count >= asset.maxCount || spend + asset.cost > budget || units >= maxUnits} />
        })}
      </div>
      {isAttack ? <AttackDoctrineEditor /> : <DefenceDoctrineEditor />}
      <div className="game-action-row">
        <button className="game-button game-button--ghost" onClick={() => store.setPhase(isAttack ? 'defender-handoff' : 'briefing')}><ArrowLeft size={13} /> Back</button>
        <button className="game-button game-button--primary" disabled={!canCommit} onClick={() => store.setPhase(isAttack ? 'final-lock' : 'defender-handoff')}><FileLock2 size={13} /> Commit plan</button>
      </div>
    </div>
  )
}

function IntelPicker() {
  const level = useGameModeStore((state) => state.intelLevel)
  const setLevel = useGameModeStore((state) => state.setIntelLevel)
  const defenceForce = useGameModeStore((state) => state.defenceForce)
  const options: { id: IntelLevel; name: string; detail: string }[] = [
    { id: 'none', name: 'Blind entry', detail: 'No defensive intelligence' },
    { id: 'signals', name: 'Signals picture', detail: `Estimate: ${Math.max(1, forceUnits(defenceForce) - 2)}–${forceUnits(defenceForce) + 2} systems` },
    { id: 'full-spectrum', name: 'Full-spectrum ISR', detail: defenceForce.map((item) => `${item.count}× ${DEFENCE_CATALOG.find((asset) => asset.id === item.assetId)?.label}`).join(' · ') || 'No systems detected' },
  ]
  return <div><span className="game-section-label">Reconnaissance package</span><div className="intel-grid">{options.map((option) => <button key={option.id} className={level === option.id ? 'is-active' : ''} onClick={() => setLevel(option.id)}><span><Eye size={12} /> {option.name}<b>{INTEL_COSTS[option.id]}</b></span><small>{option.detail}</small></button>)}</div></div>
}

function DefenceDoctrineEditor() {
  const doctrine = useGameModeStore((state) => state.defenceDoctrine)
  const setDoctrine = useGameModeStore((state) => state.setDefenceDoctrine)
  return <DoctrineCard title="Defence doctrine"><DoctrineSelect label="Formation" value={doctrine.formation} onChange={(value) => setDoctrine({ formation: value as typeof doctrine.formation })} options={[['layered', 'Layered depth'], ['ring', 'Objective ring'], ['concentrated', 'Concentrated']]}/><DoctrineSelect label="Radar posture" value={doctrine.radarPolicy} onChange={(value) => setDoctrine({ radarPolicy: value as typeof doctrine.radarPolicy })} options={[['networked', 'Networked fusion'], ['always-on', 'Always emitting'], ['silent-watch', 'Silent watch']]}/><DoctrineSelect label="Threat priority" value={doctrine.engagementPriority} onChange={(value) => setDoctrine({ engagementPriority: value as typeof doctrine.engagementPriority })} options={[['time-to-impact', 'Time to impact'], ['high-value', 'High-value threats'], ['mass-threat', 'Mass threats']]}/><DoctrineSelect label="Fire policy" value={doctrine.salvoPolicy} onChange={(value) => setDoctrine({ salvoPolicy: value as typeof doctrine.salvoPolicy })} options={[['conserve', 'Conserve rounds'], ['balanced', 'Balanced'], ['overwhelming', 'Overwhelming fire']]}/><label className="doctrine-range"><span>Ammo reserve <b>{doctrine.reservePercent}%</b></span><input type="range" min={0} max={50} step={10} value={doctrine.reservePercent} onChange={(event) => setDoctrine({ reservePercent: Number(event.target.value) })}/></label></DoctrineCard>
}

function AttackDoctrineEditor() {
  const doctrine = useGameModeStore((state) => state.attackDoctrine)
  const setDoctrine = useGameModeStore((state) => state.setAttackDoctrine)
  return <DoctrineCard title="Strike doctrine"><DoctrineSelect label="Approach" value={doctrine.approach} onChange={(value) => setDoctrine({ approach: value as typeof doctrine.approach })} options={[['west', 'Western corridor'], ['east', 'Eastern corridor'], ['north', 'Northern corridor'], ['south', 'Southern corridor']]}/><DoctrineSelect label="Formation" value={doctrine.formation} onChange={(value) => setDoctrine({ formation: value as typeof doctrine.formation })} options={[['saturation', 'Saturation front'], ['multi-axis', 'Multi-axis'], ['low-observable', 'Low observable']]}/><DoctrineSelect label="Wave timing" value={doctrine.waveTiming} onChange={(value) => setDoctrine({ waveTiming: value as typeof doctrine.waveTiming })} options={[['simultaneous', 'Simultaneous TOT'], ['staggered', 'Staggered waves'], ['feint-first', 'Feint first']]}/><DoctrineSelect label="Altitude" value={doctrine.altitude} onChange={(value) => setDoctrine({ altitude: value as typeof doctrine.altitude })} options={[['nap-of-earth', 'Nap of earth'], ['medium', 'Medium'], ['high', 'High altitude']]}/></DoctrineCard>
}

function GameHeading({ eyebrow, title, icon: Icon }: { eyebrow: string; title: string; icon: typeof Swords }) {
  return <div className="game-heading"><span><Icon size={18} /></span><div><small>{eyebrow}</small><h2>{title}</h2></div></div>
}

function BudgetMeter({ spend, budget, units, maxUnits }: { spend: number; budget: number; units: number; maxUnits: number }) {
  const percentage = Math.min(100, (spend / budget) * 100)
  return <div className="budget-meter"><div><span>Force allocation</span><strong>{spend}<small> / {budget} pts</small></strong></div><div className="budget-meter__track"><span style={{ width: `${percentage}%` }} /></div><small>{units}/{maxUnits} equipment slots committed</small></div>
}

function CatalogStep({ asset, count, onMinus, onPlus, disabledPlus }: { asset: ForceCatalogItem; count: number; onMinus: () => void; onPlus: () => void; disabledPlus: boolean }) {
  return <div className={`catalog-step ${count > 0 ? 'is-selected' : ''}`}><div><small>{asset.category} · {asset.cost} pts</small><strong>{asset.label}</strong><p>{asset.description}</p></div><div className="catalog-step__counter"><button onClick={onMinus} disabled={count === 0} aria-label={`Remove ${asset.label}`}><Minus size={11} /></button><span>{count}</span><button onClick={onPlus} disabled={disabledPlus} aria-label={`Add ${asset.label}`}><Plus size={11} /></button></div></div>
}

function DoctrineCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="doctrine-card"><span className="game-section-label">{title}</span><div className="doctrine-grid">{children}</div></div>
}

function DoctrineSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: [string, string][] }) {
  return <label><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
}

function Handoff({ eyebrow, title, description, action, onContinue }: { eyebrow: string; title: string; description: string; action: string; onContinue: () => void }) {
  return <div className="handoff-screen"><span className="handoff-screen__icon"><FileLock2 size={26} /></span><small>{eyebrow}</small><h2>{title}</h2><p>{description}</p><div className="handoff-screen__privacy"><Eye size={13} /> Previous plan is hidden</div><button className="game-button game-button--primary" onClick={onContinue}>{action}<ArrowRight size={13} /></button></div>
}

function PlanSummary({ side, units, spend, budget, doctrine }: { side: string; units: number; spend: number; budget: number; doctrine: string }) {
  return <div className="plan-summary"><small>{side}</small><strong>{units} units</strong><span>{spend}/{budget} pts</span><em>{doctrine}</em></div>
}

function Score({ side, score, tone }: { side: string; score: number; tone: string }) {
  return <div className={`score score--${tone}`}><small>{side}</small><strong>{score}</strong></div>
}

function AarMetric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Swords }) {
  return <div><Icon size={12} /><span>{label}</span><strong>{value}</strong></div>
}

function EventTimeline({ events }: { events: { type: string; time: number; entityId: string }[] }) {
  const label = (type: string) => type === 'launch' ? 'Interceptor launched' : type === 'hit' ? 'Threat destroyed' : type === 'impact' ? 'Objective impact' : 'Track escaped'
  return <div className="event-timeline"><span className="game-section-label">Engagement timeline</span>{events.map((event, index) => <div key={`${event.entityId}-${event.time}-${index}`} data-tone={event.type}><time>T+{event.time.toFixed(1)}</time><i /><span>{label(event.type)}</span></div>)}</div>
}
