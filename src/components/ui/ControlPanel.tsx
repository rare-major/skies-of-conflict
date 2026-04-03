import { useState } from 'react'
import { Settings, Crosshair, List, Layers, ChevronDown, ChevronUp } from 'lucide-react'
import { SimControls } from './SimControls'
import { SpawnPanel } from './SpawnPanel'
import { EntityList } from './EntityList'
import { ScenarioPanel } from './ScenarioPanel'
import { ParameterEditor } from './ParameterEditor'
import { ThemeToggle } from './ThemeToggle'

const tabs = [
  { id: 'sim', label: 'Simulation', icon: Settings },
  { id: 'spawn', label: 'Spawn', icon: Crosshair },
  { id: 'entities', label: 'Entities', icon: List },
  { id: 'scenarios', label: 'Scenarios', icon: Layers },
] as const

type TabId = typeof tabs[number]['id']

export function ControlPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('sim')
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2 animate-slideIn">
      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
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
          className="w-[26rem] max-h-[calc(100vh-6rem)] rounded-2xl overflow-hidden flex flex-col animate-fadeIn"
          style={{
            background: 'var(--bg-panel)',
            backdropFilter: 'blur(60px) saturate(180%)',
            WebkitBackdropFilter: 'blur(60px) saturate(180%)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-panel)',
          }}
        >
          {/* Tab bar */}
          <div className="flex p-1.5 gap-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 py-2 flex items-center justify-center gap-1.5 transition-all duration-250 cursor-pointer rounded-xl relative"
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    background: isActive ? 'var(--bg-active)' : 'transparent',
                    boxShadow: isActive ? '0 0 12px var(--accent-glow)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--bg-element)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <Icon size={13} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[9px] uppercase tracking-wider ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="mx-4" style={{ height: 1, background: 'var(--border)' }} />

          <div className="flex-1 overflow-y-auto px-5 pb-5 pt-3">
            {activeTab === 'sim' && <SimControls />}
            {activeTab === 'spawn' && <SpawnPanel />}
            {activeTab === 'entities' && (
              <div className="space-y-4">
                <EntityList />
                <ParameterEditor />
              </div>
            )}
            {activeTab === 'scenarios' && <ScenarioPanel />}
          </div>
        </div>
      )}
    </div>
  )
}
