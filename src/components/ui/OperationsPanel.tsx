import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity, Antenna, ArrowLeft, Award, Bot, CalendarDays, Check, CircleDot,
  CloudRain, Copy, Eye, Film, Gauge, Map, Medal, RadioTower, Redo2, Route,
  Satellite, Share2, Shield, Sparkles, Swords, Target, Trash2, Trophy, Undo2,
  Users, Waypoints, Wind,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AI_COMMANDERS, CAMPAIGN_THEATRES, getDailyOperation, WEATHER_LABELS } from '../../data/operations'
import { buildModeOperationScenario, forceCost } from '../../logic/game/matchBuilder'
import { useEntitySpawner } from '../../hooks/useEntitySpawner'
import { useEntityStore } from '../../store/entityStore'
import { useGameModeStore } from '../../store/gameModeStore'
import { useOperationsStore } from '../../store/operationsStore'
import { useReplayStore } from '../../store/replayStore'
import { useScenarioStore } from '../../store/scenarioStore'
import { useSimulationStore } from '../../store/simulationStore'
import { useCountryStore } from '../../store/countryStore'
import type { DoctrineUpgradeId, TacticalPoint, TacticalShape, TacticalTool, TimeOfDay, WeatherPreset } from '../../types/operations'

type OpsView = 'map' | 'intel' | 'environment' | 'doctrine' | 'career' | 'link' | 'replay'

const VIEW_TABS: { id: OpsView; label: string; icon: LucideIcon }[] = [
  { id: 'map', label: 'Map', icon: Map },
  { id: 'intel', label: 'Intel', icon: Satellite },
  { id: 'environment', label: 'World', icon: CloudRain },
  { id: 'doctrine', label: 'AI', icon: Bot },
  { id: 'career', label: 'Career', icon: Trophy },
  { id: 'link', label: 'Link', icon: Users },
  { id: 'replay', label: 'Replay', icon: Film },
]

export function OperationsPanel({ onBattleLaunched }: { onBattleLaunched?: () => void }) {
  const [view, setView] = useState<OpsView>('map')

  return (
    <div className="ops-panel">
      <div className="ops-heading">
        <span><Satellite size={18} /></span>
        <div><small>Integrated operations suite</small><h2>Command network</h2></div>
        <i>IOC</i>
      </div>
      <div className="ops-view-tabs" role="tablist" aria-label="Operations tools">
        {VIEW_TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} className={view === id ? 'is-active' : ''} onClick={() => setView(id)} role="tab" aria-selected={view === id}>
            <Icon size={12} /><span>{label}</span>
          </button>
        ))}
      </div>
      {view === 'map' && <TacticalMap />}
      {view === 'intel' && <IntelligencePicture />}
      {view === 'environment' && <EnvironmentDirector />}
      {view === 'doctrine' && <AiCommanderPanel />}
      {view === 'career' && <CareerPanel onBattleLaunched={onBattleLaunched} />}
      {view === 'link' && <CommandLinkPanel />}
      {view === 'replay' && <ReplayPanel />}
    </div>
  )
}

const TOOL_META: Record<TacticalTool, { label: string; icon: LucideIcon }> = {
  route: { label: 'Route', icon: Route },
  patrol: { label: 'CAP', icon: CircleDot },
  'defence-zone': { label: 'Sector', icon: Shield },
  'no-fly': { label: 'No-fly', icon: Target },
}

function TacticalMap() {
  const store = useOperationsStore()
  const entities = useEntityStore((state) => state.entities)
  const [shareCode, setShareCode] = useState('')
  const [status, setStatus] = useState('')

  const addPoint = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 1000 - 500
    const z = ((event.clientY - rect.top) / rect.height) * 1000 - 500
    store.addDraftPoint({ x: Math.round(x), z: Math.round(z) })
  }

  const exportPlan = () => {
    setShareCode(encodeTacticalPlan(store.tacticalShapes))
    setStatus('Tactical package generated. It contains routes and zones only.')
  }

  const importPlan = () => {
    try {
      store.importTacticalPlan(decodeTacticalPlan(shareCode))
      setStatus('Tactical package authenticated and plotted.')
    } catch {
      setStatus('The tactical package is invalid.')
    }
  }

  return (
    <div className="ops-stack">
      <div className="ops-copy"><strong>Interactive tactical map</strong><p>Plot flight paths, patrol orbits, defence sectors and restricted airspace. Shapes also appear in the 3D theatre.</p></div>
      <div className="map-tool-row">
        {(Object.keys(TOOL_META) as TacticalTool[]).map((tool) => {
          const Icon = TOOL_META[tool].icon
          return <button key={tool} className={store.tacticalTool === tool ? 'is-active' : ''} onClick={() => store.setTacticalTool(tool)}><Icon size={12} />{TOOL_META[tool].label}</button>
        })}
      </div>
      <svg className="tactical-map" viewBox="0 0 360 220" onClick={addPoint} role="img" aria-label="Interactive battlespace map">
        <defs>
          <pattern id="ops-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" /></pattern>
          <radialGradient id="ops-scan"><stop offset="0" stopColor="#56d9ff" stopOpacity="0.12" /><stop offset="1" stopColor="#56d9ff" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width="360" height="220" fill="url(#ops-scan)" />
        <rect width="360" height="220" fill="url(#ops-grid)" />
        <path d="M180 0V220M0 110H360" stroke="currentColor" strokeOpacity="0.12" strokeDasharray="3 5" />
        {store.tacticalShapes.map((shape) => <MapShape key={shape.id} shape={shape} />)}
        {store.draftPoints.length > 0 && <MapShape shape={{ id: 'draft', kind: store.tacticalTool, label: 'Draft', points: store.draftPoints, createdAt: 0 }} draft />}
        {entities.filter((entity) => entity.status === 'active').map((entity) => {
          const point = worldToMap({ x: entity.position[0], z: entity.position[2] })
          const track = useOperationsStore.getState().sensorTracks[entity.id]
          const hidden = store.fogOfWar && entity.kind === 'attack' && (!track || track.confidence < 0.12)
          if (hidden) return null
          const unknown = store.fogOfWar && entity.kind === 'attack' && (track?.confidence || 0) < 0.72
          return <g key={entity.id} transform={`translate(${point.x} ${point.y})`}><circle r={entity.kind === 'defence' ? 4.5 : 3.8} fill={entity.kind === 'defence' ? '#62efb3' : unknown ? '#ffc967' : '#ff7580'} opacity={0.9} /><circle r="8" fill="none" stroke={entity.kind === 'defence' ? '#62efb3' : '#ff7580'} strokeOpacity="0.22" /></g>
        })}
        <text x="10" y="16" className="map-coordinate">TACTICAL GRID / 1000 KM</text>
      </svg>
      <div className="map-action-row">
        <button onClick={store.undoDraftPoint} disabled={store.draftPoints.length === 0}><Undo2 size={12} />Undo</button>
        <button onClick={store.commitDraft} disabled={store.draftPoints.length === 0}><Check size={12} />Commit</button>
        <button onClick={store.clearTacticalPlan} disabled={store.tacticalShapes.length === 0}><Trash2 size={12} />Clear</button>
      </div>
      <div className="ops-share-card">
        <textarea value={shareCode} onChange={(event) => setShareCode(event.target.value)} placeholder="Paste or generate a SKYOPS tactical package…" />
        <div><button onClick={exportPlan}><Share2 size={12} />Generate</button><button onClick={importPlan}><Redo2 size={12} />Import</button></div>
        {status && <small>{status}</small>}
      </div>
    </div>
  )
}

function MapShape({ shape, draft = false }: { shape: TacticalShape; draft?: boolean }) {
  const points = shape.points.map(worldToMap)
  const color = shape.kind === 'no-fly' ? '#ff6f78' : shape.kind === 'defence-zone' ? '#65eeb5' : shape.kind === 'patrol' ? '#c9a8ff' : '#66cfff'
  if (shape.kind !== 'route' && points.length === 1) {
    return <g><circle cx={points[0].x} cy={points[0].y} r="23" fill={color} fillOpacity="0.07" stroke={color} strokeOpacity={draft ? 0.75 : 0.5} strokeDasharray="4 4" /><circle cx={points[0].x} cy={points[0].y} r="3" fill={color} /></g>
  }
  const path = points.map((point) => `${point.x},${point.y}`).join(' ')
  return <g><polyline points={path} fill={shape.kind === 'route' ? 'none' : color} fillOpacity="0.06" stroke={color} strokeWidth="1.5" strokeOpacity={draft ? 0.9 : 0.62} strokeDasharray={shape.kind === 'route' ? undefined : '5 4'} />{points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="3" fill={color} />)}</g>
}

function worldToMap(point: TacticalPoint) {
  return { x: ((point.x + 500) / 1000) * 360, y: ((point.z + 500) / 1000) * 220 }
}

function IntelligencePicture() {
  const fog = useOperationsStore((state) => state.fogOfWar)
  const setFog = useOperationsStore((state) => state.setFogOfWar)
  const sensorTracks = useOperationsStore((state) => state.sensorTracks)
  const tracks = useMemo(() => Object.values(sensorTracks).sort((a, b) => b.confidence - a.confidence), [sensorTracks])
  const messages = useOperationsStore((state) => state.radioMessages)

  return <div className="ops-stack">
    <div className="feature-toggle"><span><Eye size={15} /><div><strong>Fog of war</strong><p>Reveal hostile identity only after sensor confidence is established.</p></div></span><button className={fog ? 'is-on' : ''} onClick={() => setFog(!fog)} aria-label="Toggle fog of war" aria-pressed={fog}><i /></button></div>
    <div className="sensor-summary"><span><Satellite size={14} /><strong>{tracks.length}</strong><small>correlated tracks</small></span><span><Activity size={14} /><strong>{tracks.filter((track) => track.confidence >= 0.72).length}</strong><small>identified</small></span><span><Antenna size={14} /><strong>{tracks.filter((track) => track.jammed).length}</strong><small>jammed</small></span></div>
    <div className="track-list">
      {tracks.slice(0, 12).map((track) => <div key={track.entityId} className="track-row" data-classification={track.classification}><span className="track-symbol">{track.classification === 'identified' ? '◆' : track.classification === 'classified' ? '◇' : '?'}</span><div><strong>{track.label}</strong><small>{track.classification} · last seen T+{track.lastSeen.toFixed(1)}</small></div><span className="track-confidence">{Math.round(track.confidence * 100)}%</span><i><b style={{ width: `${track.confidence * 100}%` }} /></i></div>)}
      {tracks.length === 0 && <div className="ops-empty"><Satellite size={20} /><strong>No sensor picture</strong><p>Stage and launch a mission to begin correlating tracks.</p></div>}
    </div>
    {messages.length > 0 && <div className="radio-log"><span className="ops-label">Command net</span>{messages.slice(-5).reverse().map((message) => <div key={message.id} data-tone={message.tone}><time>T+{message.time.toFixed(1)}</time><strong>{message.speaker}</strong><p>{message.message}</p></div>)}</div>}
  </div>
}

function EnvironmentDirector() {
  const store = useOperationsStore()
  const times: TimeOfDay[] = ['dawn', 'day', 'dusk', 'night']
  return <div className="ops-stack">
    <div className="ops-copy"><strong>Dynamic battlespace</strong><p>Lighting, fog, precipitation and sensor performance respond to the selected conditions.</p></div>
    <span className="ops-label">Weather system</span>
    <div className="weather-grid">{(Object.keys(WEATHER_LABELS) as WeatherPreset[]).map((weather) => <button key={weather} className={store.weather === weather ? 'is-active' : ''} onClick={() => store.setWeather(weather)}><CloudRain size={14} /><strong>{WEATHER_LABELS[weather].name}</strong><small>{WEATHER_LABELS[weather].detail}</small></button>)}</div>
    <span className="ops-label">Time of operation</span>
    <div className="time-selector">{times.map((time) => <button key={time} className={store.timeOfDay === time ? 'is-active' : ''} onClick={() => store.setTimeOfDay(time)}>{time}</button>)}</div>
    <label className="wind-control"><span><Wind size={13} /> Wind and turbulence <strong>{Math.round(store.windStrength * 100)}%</strong></span><input type="range" min="0" max="1" step="0.1" value={store.windStrength} onChange={(event) => store.setWindStrength(Number(event.target.value))} /></label>
    <div className="feature-toggle"><span><Film size={15} /><div><strong>Cinematic mission director</strong><p>Automatically prioritizes launches, near misses and terminal interceptions.</p></div></span><button className={store.directorEnabled ? 'is-on' : ''} onClick={() => store.setDirectorEnabled(!store.directorEnabled)} aria-label="Toggle cinematic mission director" aria-pressed={store.directorEnabled}><i /></button></div>
    <div className="feature-toggle"><span><RadioTower size={15} /><div><strong>Operator chatter</strong><p>Generate concise sensor and engagement callouts on the command net.</p></div></span><button className={store.radioChatter ? 'is-on' : ''} onClick={() => store.setRadioChatter(!store.radioChatter)} aria-label="Toggle operator chatter" aria-pressed={store.radioChatter}><i /></button></div>
    <div className="feature-toggle"><span><Gauge size={15} /><div><strong>Broadcast presentation</strong><p>Add live programme graphics, scorebug and lower-third telemetry.</p></div></span><button className={store.broadcastMode ? 'is-on' : ''} onClick={() => store.setBroadcastMode(!store.broadcastMode)} aria-label="Toggle broadcast presentation" aria-pressed={store.broadcastMode}><i /></button></div>
  </div>
}

function AiCommanderPanel() {
  const commander = useOperationsStore((state) => state.aiCommander)
  const setCommander = useOperationsStore((state) => state.setAiCommander)
  return <div className="ops-stack"><div className="ops-copy"><strong>AI command personalities</strong><p>Choose the opposing doctrine. Personalities alter reaction speed, signatures, deception and target selection during live resolution.</p></div><div className="commander-grid">{AI_COMMANDERS.map((option) => <button key={option.id} className={commander === option.id ? 'is-active' : ''} onClick={() => setCommander(option.id)}><span><Bot size={15} /></span><div><small>{option.callsign}</small><strong>{option.name}</strong><p>{option.description}</p><em>{option.trait}</em></div></button>)}</div></div>
}

function CareerPanel({ onBattleLaunched }: { onBattleLaunched?: () => void }) {
  const store = useOperationsStore()
  const daily = useMemo(() => getDailyOperation(), [])
  const { loadScenario } = useEntitySpawner()
  const doctrineTrack: { id: DoctrineUpgradeId; name: string; detail: string; required: number }[] = [
    { id: 'sensor-fusion', name: 'Sensor Fusion', detail: 'Build track confidence faster.', required: 0 },
    { id: 'rapid-response', name: 'Rapid Response', detail: 'Shorten engagement decision cycles.', required: 2 },
    { id: 'hardened-network', name: 'Hardened Network', detail: 'Reduce weather and EW interference.', required: 4 },
    { id: 'terminal-focus', name: 'Terminal Focus', detail: 'Improve close-layer weapon accuracy.', required: 7 },
  ]

  const launchDaily = () => {
    const scenario = buildModeOperationScenario(daily, daily.seed)
    const game = useGameModeStore.getState()
    game.selectMode('puzzle')
    game.setOperationName(daily.name)
    game.setForces(daily.defenceForce, daily.attackForce)
    game.setDefenceDoctrine(daily.defenceDoctrine)
    game.setAttackDoctrine(daily.attackDoctrine)
    game.setRules({ countryId: daily.countryId, seed: daily.seed, defenderBudget: forceCost(daily.defenceForce, 'defence'), attackerBudget: forceCost(daily.attackForce, 'attack'), maxDefenceUnits: 20, maxAttackUnits: 30 })
    useCountryStore.getState().setCountry(daily.countryId)
    loadScenario(scenario)
    useScenarioStore.getState().setActiveScenario(scenario)
    useReplayStore.getState().startRecording()
    game.setResult(null)
    game.setPhase('battle')
    useSimulationStore.getState().start()
    onBattleLaunched?.()
  }

  return <div className="ops-stack">
    <div className="career-hero"><span><Award size={25} /></span><div><small>Commander {store.profile.callsign}</small><h3>Level {store.profile.level} · Rating {store.profile.rating}</h3><p>{store.profile.xp} XP · {store.profile.victories} victories across {store.profile.operations} operations</p></div></div>
    <div className="daily-card"><span><CalendarDays size={19} /></span><div><small>Daily seeded challenge · {daily.challengeDate}</small><strong>{daily.name}</strong><p>{daily.description}</p><em>Seed {daily.seed} · {daily.difficulty} · {store.profile.dailyStreak} day streak</em></div><button onClick={launchDaily}><Sparkles size={12} />Deploy</button></div>
    <span className="ops-label">Campaign theatres</span>
    <div className="campaign-theatre-list">{CAMPAIGN_THEATRES.map((campaign) => <button key={campaign.id} className={store.activeCampaignId === campaign.id ? 'is-active' : ''} onClick={() => store.setActiveCampaign(campaign.id)} style={{ '--campaign-tone': campaign.tone } as React.CSSProperties}><span>{campaign.era}</span><strong>{campaign.name}</strong><p>{campaign.description}</p><small>{campaign.operations} linked operations</small></button>)}</div>
    <span className="ops-label">Decorations</span>
    <div className="medal-rack">{store.profile.medals.length > 0 ? store.profile.medals.map((medal) => <span key={medal}><Medal size={13} />{medal}</span>) : <p>Complete operations to earn commander citations.</p>}</div>
    <span className="ops-label">Doctrine progression</span>
    <div className="doctrine-track">{doctrineTrack.map((doctrine) => { const unlocked = store.profile.doctrines.includes(doctrine.id); return <button key={doctrine.id} disabled={!unlocked} className={store.activeDoctrine === doctrine.id ? 'is-active' : ''} onClick={() => store.setActiveDoctrine(doctrine.id)}><span>{unlocked ? <Check size={11} /> : doctrine.required}</span><div><strong>{doctrine.name}</strong><small>{unlocked ? doctrine.detail : `Unlock after ${doctrine.required} operations`}</small></div></button> })}</div>
    <button className="career-reset" onClick={store.resetProfile}><Trash2 size={11} />Reset local service record</button>
  </div>
}

function CommandLinkPanel() {
  const link = useOperationsStore((state) => state.commandLink)
  const createRoom = useOperationsStore((state) => state.createRoom)
  const joinRoom = useOperationsStore((state) => state.joinRoom)
  const leaveRoom = useOperationsStore((state) => state.leaveRoom)
  const setPeerCount = useOperationsStore((state) => state.setPeerCount)
  const shapes = useOperationsStore((state) => state.tacticalShapes)
  const importShapes = useOperationsStore((state) => state.importTacticalPlan)
  const [code, setCode] = useState('')
  const channelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    if (link.status === 'offline' || !link.roomCode || typeof BroadcastChannel === 'undefined') return
    const channel = new BroadcastChannel(`skies-conflict-${link.roomCode}`)
    channelRef.current = channel
    channel.onmessage = (event) => {
      if (event.data?.type === 'presence') setPeerCount(Math.max(1, useOperationsStore.getState().commandLink.peerCount + 1))
      if (event.data?.type === 'tactical-plan' && Array.isArray(event.data.shapes)) importShapes(event.data.shapes)
    }
    channel.postMessage({ type: 'presence', role: link.role })
    return () => { channel.close(); channelRef.current = null }
  }, [importShapes, link.role, link.roomCode, link.status, setPeerCount])

  const syncPlan = () => channelRef.current?.postMessage({ type: 'tactical-plan', shapes })

  if (link.status !== 'offline') return <div className="ops-stack"><div className="link-live"><span className="battle-live-card__pulse" /><div><small>Command link active</small><strong>ROOM {link.roomCode}</strong><p>{link.role} station · {link.peerCount} connected peer{link.peerCount === 1 ? '' : 's'}</p></div></div><div className="link-actions"><button onClick={() => navigator.clipboard?.writeText(link.roomCode)}><Copy size={12} />Copy room code</button><button onClick={syncPlan}><Waypoints size={12} />Sync tactical plan</button></div><div className="briefing-note"><Antenna size={14} /><p>This local command-link transport synchronizes tabs on the same browser origin. The room protocol is isolated so a WebSocket or WebRTC transport can replace it without changing game state.</p></div><button className="game-button game-button--ghost" onClick={leaveRoom}><ArrowLeft size={12} />Disconnect</button></div>

  return <div className="ops-stack"><div className="ops-copy"><strong>Multiplayer command link</strong><p>Open a commander, wingman or spectator station and synchronize tactical plans between local sessions.</p></div><div className="link-role-grid"><button onClick={() => createRoom('commander')}><Swords size={18} /><strong>Host command</strong><small>Create a new operations room</small></button><button onClick={() => createRoom('spectator')}><Eye size={18} /><strong>Broadcast desk</strong><small>Open a spectator room</small></button></div><label className="join-room"><span>Join existing room</span><div><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="ROOM CODE" maxLength={8} /><button disabled={code.length < 4} onClick={() => joinRoom(code)}><Users size={12} />Join</button></div></label></div>
}

function ReplayPanel() {
  const frames = useReplayStore((state) => state.frames)
  const isReplaying = useReplayStore((state) => state.isReplaying)
  const index = useReplayStore((state) => state.currentFrameIndex)
  const seek = useReplayStore((state) => state.seekTo)
  const stop = useReplayStore((state) => state.stopReplay)
  const entities = useEntityStore((state) => state.entities)
  const interceptors = useEntityStore((state) => state.interceptors)
  const events = frames.flatMap((frame) => frame.events)

  const play = () => {
    useReplayStore.getState().setPreReplaySnapshot({ entities: JSON.parse(JSON.stringify(entities)), interceptors: JSON.parse(JSON.stringify(interceptors)) })
    useReplayStore.getState().startReplay()
  }

  return <div className="ops-stack"><div className="ops-copy"><strong>Cinematic after-action replay</strong><p>Scrub through the engagement and jump directly to launches, kills, impacts and escapes.</p></div>{frames.length > 0 ? <><div className="replay-hero"><Film size={19} /><div><strong>{frames.length} recorded frames</strong><p>{events.length} indexed combat events · T+{frames.at(-1)?.time.toFixed(1)} seconds</p></div><button onClick={isReplaying ? stop : play}>{isReplaying ? 'Stop' : 'Play'}</button></div><input className="replay-scrubber" type="range" min={0} max={Math.max(0, frames.length - 1)} value={index} onChange={(event) => seek(Number(event.target.value))} /><div className="replay-events">{events.slice(-10).reverse().map((event, eventIndex) => { const frameIndex = frames.findIndex((frame) => frame.events.includes(event)); return <button key={`${event.entityId}-${event.time}-${eventIndex}`} onClick={() => seek(Math.max(0, frameIndex))} data-tone={event.type}><time>T+{event.time.toFixed(1)}</time><span>{event.type === 'launch' ? 'Interceptor launch' : event.type === 'hit' ? 'Threat destroyed' : event.type === 'impact' ? 'Objective impact' : 'Track escaped'}</span><Target size={11} /></button> })}</div></> : <div className="ops-empty"><Film size={22} /><strong>No replay available</strong><p>Enable recording or launch a War Room operation to create an indexed after-action record.</p></div>}</div>
}

function encodeTacticalPlan(shapes: TacticalShape[]) {
  const bytes = new TextEncoder().encode(JSON.stringify({ version: 1, shapes }))
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return `SKYOPS1-${btoa(binary)}`
}

function decodeTacticalPlan(code: string): TacticalShape[] {
  const encoded = code.trim().replace(/^SKYOPS1-/, '')
  const binary = atob(encoded)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  const value = JSON.parse(new TextDecoder().decode(bytes)) as { shapes?: TacticalShape[] }
  if (!Array.isArray(value.shapes)) throw new Error('Invalid tactical plan')
  return value.shapes
}
