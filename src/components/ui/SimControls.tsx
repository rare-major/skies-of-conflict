import { useEffect, useRef } from 'react'
import {
  Play, Pause, RotateCcw, Trash2, Crosshair, Shield, Target,
  Eye, Wifi, Mountain, Rewind, Move, Swords, UserCheck, Clapperboard, Atom, Globe,
  Flame, ShieldCheck, CircleOff, Layers
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useSimulationStore } from '../../store/simulationStore'
import { useEntityStore } from '../../store/entityStore'
import { useCameraStore, type CameraMode } from '../../store/cameraStore'
import { useReplayStore } from '../../store/replayStore'
import { useUIStore } from '../../store/uiStore'
import { BUTTON_TIPS, TOGGLE_TIPS, CAMERA_TIPS, TIMESCALE_TIPS } from '../../data/tooltipDescriptions'
import { IconButton } from './IconButton'
import { SegmentedControl } from './SegmentedControl'
import { ToggleSwitch } from './ToggleSwitch'

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`hud-card rounded-2xl p-4 ${className}`}
      style={{ background: 'var(--bg-element)', border: '1px solid var(--border)' }}
    >
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="section-label text-[9px] uppercase tracking-[0.14em] font-bold block" style={{ color: 'var(--text-muted)' }}>
      {children}
    </span>
  )
}

interface SimControlsProps {
  onOpenScenarios?: () => void
}

export function SimControls({ onOpenScenarios }: SimControlsProps) {
  const isRunning = useSimulationStore((s) => s.isRunning)
  const timeScale = useSimulationStore((s) => s.timeScale)
  const elapsed = useSimulationStore((s) => s.elapsed)
  const showTrails = useSimulationStore((s) => s.showTrails)
  const showRadar = useSimulationStore((s) => s.showRadar)
  const showCollisions = useSimulationStore((s) => s.showCollisions)
  const showTerrain = useSimulationStore((s) => s.showTerrain)
  const showDomeGrid = useSimulationStore((s) => s.showDomeGrid)
  const toggleRunning = useSimulationStore((s) => s.toggleRunning)
  const simReset = useSimulationStore((s) => s.reset)
  const setTimeScale = useSimulationStore((s) => s.setTimeScale)
  const setShowTrails = useSimulationStore((s) => s.setShowTrails)
  const setShowRadar = useSimulationStore((s) => s.setShowRadar)
  const setShowCollisions = useSimulationStore((s) => s.setShowCollisions)
  const setShowTerrain = useSimulationStore((s) => s.setShowTerrain)
  const setShowDomeGrid = useSimulationStore((s) => s.setShowDomeGrid)
  const initialSnapshot = useSimulationStore((s) => s.initialSnapshot)
  const collapseForEngagement = useUIStore((s) => s.collapseForEngagement)

  const cameraMode = useCameraStore((s) => s.mode)
  const setCameraMode = useCameraStore((s) => s.setMode)

  const entities = useEntityStore((s) => s.entities)
  const interceptors = useEntityStore((s) => s.interceptors)
  const attacks = entities.filter((e) => e.kind === 'attack')
  const activeAttacks = attacks.filter((e) => e.status === 'active').length
  const activeDefences = entities.filter((e) => e.kind === 'defence' && e.status === 'active').length
  const activeInterceptors = interceptors.filter((i) => i.status === 'active').length
  const attackHits = attacks.filter((e) => e.status === 'exploded').length
  const attackIntercepted = attacks.filter((e) => e.status === 'intercepted').length
  const attackMissed = attacks.filter((e) => e.status === 'destroyed' || e.status === 'missed').length
  const canRun = activeAttacks > 0

  const isRecording = useReplayStore((s) => s.isRecording)
  const isReplaying = useReplayStore((s) => s.isReplaying)
  const frames = useReplayStore((s) => s.frames)
  const currentFrameIndex = useReplayStore((s) => s.currentFrameIndex)
  const startReplay = useReplayStore((s) => s.startReplay)
  const stopReplay = useReplayStore((s) => s.stopReplay)
  const seekTo = useReplayStore((s) => s.seekTo)
  const toggleRecording = useReplayStore((s) => s.toggleRecording)

  const hasFrames = frames.length > 0

  const wasRunning = useRef(isRunning)
  useEffect(() => {
    if (wasRunning.current && !isRunning && activeAttacks === 0) {
      const replay = useReplayStore.getState()
      if (replay.isRecording) replay.stopRecording()
    }
    wasRunning.current = isRunning
  }, [activeAttacks, isRunning])

  const handleStartReplay = () => {
    const entityStore = useEntityStore.getState()
    useReplayStore.getState().setPreReplaySnapshot({
      entities: JSON.parse(JSON.stringify(entityStore.entities)),
      interceptors: JSON.parse(JSON.stringify(entityStore.interceptors)),
    })
    const firstFrame = frames[0]
    if (firstFrame) {
      for (const snapshot of firstFrame.entities) {
        if (snapshot.kind === 'interceptor') {
          entityStore.updateInterceptorPosition(snapshot.id, snapshot.position, snapshot.velocity)
          entityStore.setInterceptorStatus(snapshot.id, snapshot.status)
        } else {
          entityStore.updateEntityPosition(snapshot.id, snapshot.position, snapshot.velocity)
          entityStore.setEntityStatus(snapshot.id, snapshot.status)
        }
      }
    }
    startReplay()
  }

  const handleStopReplay = () => {
    stopReplay()
    const snapshot = useReplayStore.getState().preReplaySnapshot
    if (snapshot) {
      const entityStore = useEntityStore.getState()
      entityStore.setEntities(snapshot.entities)
      for (const int of snapshot.interceptors) {
        entityStore.updateInterceptorPosition(int.id, int.position, int.velocity)
        entityStore.setInterceptorStatus(int.id, int.status)
      }
    }
  }

  const handleToggleRunning = () => {
    const isStarting = !isRunning
    if (!isRunning && !initialSnapshot) {
      const snap = useEntityStore.getState()
      if (snap.entities.length > 0) {
        useSimulationStore.getState().setInitialSnapshot({
          entities: JSON.parse(JSON.stringify(snap.entities)),
          interceptors: [],
        })
      }
    }
    toggleRunning()
    if (isStarting) collapseForEngagement()
  }

  const handleReset = () => {
    simReset()
    useReplayStore.getState().clear()
    const camera = useCameraStore.getState()
    camera.setFollowEntity(null)
    if (camera.mode === 'follow') camera.setMode('combat')
    const snap = useSimulationStore.getState().initialSnapshot
    if (snap) {
      useEntityStore.setState({
        entities: JSON.parse(JSON.stringify(snap.entities)),
        interceptors: [],
        explosions: [],
        selectedEntityId: null,
      })
    } else {
      useEntityStore.getState().clearAll()
    }
  }

  const handleClear = () => {
    simReset()
    useEntityStore.getState().clearAll()
    useReplayStore.getState().clear()
    useSimulationStore.getState().setInitialSnapshot(null)
    const camera = useCameraStore.getState()
    camera.setFollowEntity(null)
    camera.setMode('free')
  }

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60

  return (
    <div className="sim-controls">
      {entities.length === 0 && (
        <div className="empty-mission-card">
          <span className="empty-mission-card__icon"><Layers size={18} /></span>
          <div className="empty-mission-card__copy min-w-0 flex-1">
            <h3>No forces deployed</h3>
            <p>Choose a ready-made mission, then launch the engagement from here.</p>
          </div>
          <button type="button" onClick={onOpenScenarios}>Open missions</button>
        </div>
      )}

      {/* Timer + Stats */}
      <Card className="sim-overview-card">
        <div className="simulation-clock-row">
          <div className="simulation-clock flex items-baseline gap-0.5">
            <span
              className={`text-[28px] font-bold font-mono-timer ${isRunning ? 'animate-timer-pulse' : ''}`}
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              {mins > 0 ? `${mins}:${secs.toFixed(1).padStart(4, '0')}` : secs.toFixed(1)}
            </span>
            <span className="text-[9px] uppercase tracking-wider font-medium ml-1" style={{ color: 'var(--text-dim)' }}>
              {mins > 0 ? 'min' : 'sec'}
            </span>
          </div>
          <div className="simulation-status flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: isRunning ? 'var(--green)' : 'var(--text-muted)' }}>
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: isRunning ? 'var(--green)' : 'var(--text-dim)',
                boxShadow: isRunning ? '0 0 8px var(--green)' : 'none',
              }}
            />
            {isRunning ? 'Live' : elapsed > 0 && !canRun ? 'Complete' : elapsed > 0 ? 'Paused' : 'Standby'}
          </div>
        </div>

        <div className="engagement-stats-grid">
          <StatBadge icon={Crosshair} value={activeAttacks} label="Inbound" color="var(--red)" bg="rgba(248,113,113,0.1)" />
          <StatBadge icon={Shield} value={activeDefences} label="Defenders" color="var(--green)" bg="rgba(74,222,128,0.1)" />
          <StatBadge icon={Target} value={activeInterceptors} label="In flight" color="var(--accent)" bg="rgba(96,165,250,0.1)" />
          <StatBadge icon={Flame} value={attackHits} label="Impacts" color="var(--orange)" bg="rgba(251,146,60,0.1)" />
          <StatBadge icon={ShieldCheck} value={attackIntercepted} label="Stopped" color="#22d3ee" bg="rgba(34,211,238,0.1)" />
          <StatBadge icon={CircleOff} value={attackMissed} label="Escaped" color="var(--text-muted)" bg="rgba(148,163,184,0.06)" />
        </div>
      </Card>

      {/* Primary CTA + secondary actions */}
      <div className="engagement-actions">
        <IconButton
          icon={isRunning ? Pause : Play}
          label={isRunning ? 'Pause' : 'Engage'}
          onClick={handleToggleRunning}
          variant="primary"
          className="flex-[2]"
          disabled={!isRunning && !canRun}
          tooltip={isRunning ? BUTTON_TIPS['Pause'] : BUTTON_TIPS['Start']}
        />
        <IconButton
          icon={RotateCcw}
          label="Reset"
          onClick={handleReset}
          variant="default"
          className="flex-1"
          disabled={entities.length === 0}
          tooltip={BUTTON_TIPS['Reset']}
        />
        <IconButton
          icon={Trash2}
          onClick={handleClear}
          variant="red"
          className="flex-none w-10"
          tooltip={BUTTON_TIPS['Clear']}
          size={13}
          disabled={entities.length === 0}
        />
      </div>

      {/* Record */}
      {isRunning && (
        <button
          onClick={toggleRecording}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-medium transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.97]"
          style={{
            background: isRecording ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-element)',
            border: `1px solid ${isRecording ? 'rgba(239, 68, 68, 0.25)' : 'var(--border)'}`,
            color: isRecording ? 'var(--red)' : 'var(--text-muted)',
          }}
        >
          <span
            className={isRecording ? 'animate-record-pulse' : ''}
            style={{
              display: 'inline-block',
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: isRecording ? 'var(--red)' : 'var(--text-dim)',
            }}
          />
          {isRecording ? `Recording · ${frames.length} frames` : 'Record'}
        </button>
      )}

      <Card className="control-stack-card">
        <div className="control-stack-section">
          <SectionLabel>Simulation speed</SectionLabel>
          <SegmentedControl
            options={[
              { value: 0.5, label: '0.5×', tooltip: TIMESCALE_TIPS['0.5x'] },
              { value: 1, label: '1×', tooltip: TIMESCALE_TIPS['1x'] },
              { value: 2, label: '2×', tooltip: TIMESCALE_TIPS['2x'] },
              { value: 5, label: '5×', tooltip: TIMESCALE_TIPS['5x'] },
              { value: 10, label: '10×', tooltip: TIMESCALE_TIPS['10x'] },
            ]}
            value={timeScale}
            onChange={setTimeScale}
          />
        </div>
        <div className="control-stack-divider" />
        <div className="control-stack-section">
          <SectionLabel>Camera director</SectionLabel>
          <SegmentedControl
            options={[
              { value: 'free' as CameraMode, label: 'Free', icon: Move, tooltip: CAMERA_TIPS['free'] },
              { value: 'combat' as CameraMode, label: 'Combat', icon: Swords, tooltip: CAMERA_TIPS['combat'] },
              { value: 'follow' as CameraMode, label: 'Follow', icon: UserCheck, tooltip: CAMERA_TIPS['follow'] },
              { value: 'cinematic' as CameraMode, label: 'Cine', icon: Clapperboard, tooltip: CAMERA_TIPS['cinematic'] },
            ]}
            value={cameraMode}
            onChange={setCameraMode}
          />
        </div>
      </Card>

      {/* Replay */}
      {hasFrames && !isRunning && !isRecording && (
        <Card>
          <SectionLabel>Replay · {frames.length} frames</SectionLabel>
          <div className="flex gap-2">
            <IconButton
              icon={isReplaying ? Pause : Rewind}
              label={isReplaying ? 'Stop' : 'Play Replay'}
              onClick={isReplaying ? handleStopReplay : handleStartReplay}
              variant="accent"
              className="flex-1"
            />
          </div>
          {isReplaying && frames.length > 0 && (
            <input
              type="range"
              min={0}
              max={frames.length - 1}
              value={currentFrameIndex}
              onChange={(e) => seekTo(parseInt(e.target.value))}
              className="w-full h-1 rounded-full appearance-none cursor-pointer mt-3
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)]
                [&::-webkit-slider-thumb]:shadow-[0_0_6px_var(--accent-glow)]"
              style={{ background: 'var(--bg-element)' }}
            />
          )}
        </Card>
      )}

      <Card className="display-controls-card">
        <div>
          <SectionLabel>Tactical overlays</SectionLabel>
          <div className="space-y-0.5">
            <ToggleSwitch label="Trails" value={showTrails} onChange={setShowTrails} icon={Eye} tooltip={TOGGLE_TIPS['Trails']} />
            <ToggleSwitch label="Radar Cones" value={showRadar} onChange={setShowRadar} icon={Wifi} tooltip={TOGGLE_TIPS['Radar']} />
            <ToggleSwitch label="Dome Grid" value={showDomeGrid} onChange={setShowDomeGrid} icon={Globe} tooltip={TOGGLE_TIPS['Dome Grid']} />
          </div>
        </div>
        <div>
          <SectionLabel>Environment</SectionLabel>
          <div className="space-y-0.5">
            <ToggleSwitch label="Terrain" value={showTerrain} onChange={setShowTerrain} icon={Mountain} tooltip={TOGGLE_TIPS['Terrain']} />
            <ToggleSwitch label="Hit volumes" value={showCollisions} onChange={setShowCollisions} icon={Atom} tooltip={TOGGLE_TIPS['Collisions']} />
          </div>
        </div>
      </Card>
    </div>
  )
}

function StatBadge({ icon: Icon, value, label, color, bg }: {
  icon: LucideIcon; value: number; label: string; color: string; bg: string
}) {
  return (
    <div
      className="stat-badge flex flex-col items-center rounded-xl transition-all duration-200"
      style={{ background: bg, border: '1px solid var(--border)' }}
    >
      <Icon size={13} style={{ color, opacity: 0.7 }} />
      <span
        key={value}
        className="stat-badge__value text-base font-bold tabular-nums animate-number-pop"
        style={{ color }}
      >
        {value}
      </span>
      <span className="stat-badge__label text-[8px] uppercase tracking-[0.1em] font-bold" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
    </div>
  )
}
