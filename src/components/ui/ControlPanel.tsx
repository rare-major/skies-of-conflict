import { useEffect, useState } from 'react'
import { Settings, Crosshair, List, Layers, ChevronDown, ChevronUp, RadioTower, Swords, Satellite } from 'lucide-react'
import { SimControls } from './SimControls'
import { SpawnPanel } from './SpawnPanel'
import { EntityList } from './EntityList'
import { ScenarioPanel } from './ScenarioPanel'
import { ParameterEditor } from './ParameterEditor'
import { ThemeToggle } from './ThemeToggle'
import { useEntityStore } from '../../store/entityStore'
import { GameModePanel } from './GameModePanel'
import { useGameModeStore } from '../../store/gameModeStore'
import { useUIStore } from '../../store/uiStore'
import { OperationsPanel } from './OperationsPanel'

const tabs = [
  { id: 'sim', label: 'Simulation', icon: Settings },
  { id: 'spawn', label: 'Spawn', icon: Crosshair },
  { id: 'entities', label: 'Entities', icon: List },
  { id: 'scenarios', label: 'Scenarios', icon: Layers },
  { id: 'ops', label: 'Operations', icon: Satellite },
  { id: 'game', label: 'War game', icon: Swords },
] as const

type TabId = typeof tabs[number]['id']

export function ControlPanel() {
  const hasEntities = useEntityStore((s) => s.entities.length > 0)
  const [activeTab, setActiveTab] = useState<TabId>(hasEntities ? 'sim' : 'scenarios')
  const collapsed = useUIStore((s) => s.commandPanelCollapsed)
  const setCollapsed = useUIStore((s) => s.setCommandPanelCollapsed)
  useEffect(() => {
    return useGameModeStore.subscribe((state, previous) => {
      if (state.phase === 'debrief' && previous.phase !== 'debrief') setActiveTab('game')
    })
  }, [])

  return (
    <div className="control-panel-shell animate-slideIn">
      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand command panel' : 'Collapse command panel'}
          aria-expanded={!collapsed}
          className="panel-collapse-button"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(40px) saturate(150%)',
            WebkitBackdropFilter: 'blur(40px) saturate(150%)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {!collapsed && (
        <div
          className="command-panel animate-fadeIn"
          style={{
            background: 'var(--bg-panel)',
            backdropFilter: 'blur(60px) saturate(180%)',
            WebkitBackdropFilter: 'blur(60px) saturate(180%)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-panel)',
          }}
        >
          <div className="command-panel__masthead">
            <div>
              <span>Command deck</span>
              <strong>Tactical control</strong>
            </div>
            <div className="command-link"><RadioTower size={12} /> C2 linked</div>
          </div>

          <div className="panel-tabs" role="tablist" aria-label="Command panel">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={isActive}
                  className={`panel-tab ${isActive ? 'is-active' : ''}`}
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    background: isActive ? 'var(--bg-active)' : 'transparent',
                    boxShadow: isActive ? 'inset 0 0 18px rgba(115, 201, 255, 0.05)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--bg-element)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <Icon size={13} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[10px] uppercase tracking-wider ${isActive ? 'font-bold' : 'font-semibold'}`}>
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="panel-content" role="tabpanel">
            {activeTab === 'sim' && <SimControls onOpenScenarios={() => setActiveTab('scenarios')} />}
            {activeTab === 'spawn' && <SpawnPanel />}
            {activeTab === 'entities' && (
              <div className="space-y-4">
                <EntityList />
                <ParameterEditor />
              </div>
            )}
            {activeTab === 'scenarios' && <ScenarioPanel onScenarioLoaded={() => setActiveTab('sim')} />}
            {activeTab === 'ops' && <OperationsPanel onBattleLaunched={() => setActiveTab('sim')} />}
            {activeTab === 'game' && <GameModePanel onBattleLaunched={() => setActiveTab('sim')} />}
          </div>
        </div>
      )}
    </div>
  )
}
