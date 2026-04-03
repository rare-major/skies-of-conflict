import { useState } from 'react'
import { Save, Trash2, Layers } from 'lucide-react'
import { useScenarioStore } from '../../store/scenarioStore'
import { useEntitySpawner } from '../../hooks/useEntitySpawner'
import { useEntityStore } from '../../store/entityStore'
import { useCountryStore } from '../../store/countryStore'
import { getCountryById, COUNTRIES } from '../../data/countries'
import { CountrySelector } from './CountrySelector'
import { IconButton } from './IconButton'
import type { Scenario } from '../../types/scenarios'

export function ScenarioPanel() {
  const presets = useScenarioStore((s) => s.presets)
  const saved = useScenarioStore((s) => s.saved)
  const saveScenario = useScenarioStore((s) => s.saveScenario)
  const deleteSaved = useScenarioStore((s) => s.deleteSaved)
  const { loadScenario } = useEntitySpawner()
  const [saveName, setSaveName] = useState('')

  const selectedCountryId = useCountryStore((s) => s.selectedCountryId)
  const setCountry = useCountryStore((s) => s.setCountry)
  const country = selectedCountryId ? getCountryById(selectedCountryId) : null

  const countryScenarios = country
    ? presets.filter((s) => country.scenarioIds.includes(s.id))
    : []
  const genericScenarios = country
    ? presets.filter((s) => !country.scenarioIds.includes(s.id))
    : presets

  const handleLoadScenario = (scenario: Scenario) => {
    if (!selectedCountryId) {
      const match = COUNTRIES.find((c) => c.scenarioIds.includes(scenario.id))
      if (match) setCountry(match.id)
    }
    loadScenario(scenario)
  }

  const handleSave = () => {
    if (!saveName.trim()) return
    const entities = useEntityStore.getState().entities
    const scenario: Scenario = {
      id: crypto.randomUUID(),
      name: saveName.trim(),
      description: 'Custom scenario',
      attacks: entities
        .filter((e) => e.kind === 'attack')
        .map((e) => ({
          type: e.type as any,
          trajectory: (e as any).trajectory,
          position: e.position,
          velocity: e.velocity,
          isDecoy: (e as any).isDecoy,
        })),
      defences: entities
        .filter((e) => e.kind === 'defence')
        .map((e) => ({
          type: e.type as any,
          trajectory: (e as any).trajectory,
          position: e.position,
        })),
    }
    saveScenario(scenario)
    setSaveName('')
  }

  return (
    <div className="space-y-4">
      <CountrySelector />

      {/* Country scenarios */}
      {countryScenarios.length > 0 && (
        <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-1.5">
            <Layers size={12} style={{ color: 'var(--accent)' }} />
            <h3 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              {country?.name} Scenarios
            </h3>
          </div>
          {countryScenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} onLoad={() => handleLoadScenario(scenario)} />
          ))}
        </div>
      )}

      {/* Generic / all scenarios */}
      <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1.5">
          <Layers size={12} style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {country ? 'Other Scenarios' : 'Presets'}
          </h3>
        </div>
        {genericScenarios.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} onLoad={() => handleLoadScenario(scenario)} />
        ))}
      </div>

      {/* Save */}
      <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <h3 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Save Current
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Scenario name..."
            className="flex-1 rounded-lg px-3 py-1.5 text-xs outline-none transition-colors"
            style={{
              background: 'var(--bg-element)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
          <IconButton icon={Save} onClick={handleSave} />
        </div>
      </div>

      {saved.length > 0 && (
        <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <h3 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Saved ({saved.length})
          </h3>
          {saved.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onLoad={() => loadScenario(scenario)}
              onDelete={() => deleteSaved(scenario.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ScenarioCard({ scenario, onLoad, onDelete }: {
  scenario: Scenario; onLoad: () => void; onDelete?: () => void
}) {
  return (
    <div
      className="rounded-lg p-3 group transition-all duration-150"
      style={{ background: 'var(--bg-element)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between mb-1">
        <h4 className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{scenario.name}</h4>
        <div className="flex gap-1">
          <button
            onClick={onLoad}
            className="text-[9px] px-2 py-0.5 rounded transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
            style={{ background: 'var(--bg-active)', color: 'var(--accent)' }}
          >
            Load
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer"
              style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)' }}
            >
              <Trash2 size={10} />
            </button>
          )}
        </div>
      </div>
      <p className="text-[9px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>{scenario.description}</p>
      <div className="flex gap-3 mt-1.5">
        <span className="text-[8px]" style={{ color: 'var(--red)', opacity: 0.5 }}>{scenario.attacks.length} attacks</span>
        <span className="text-[8px]" style={{ color: 'var(--green)', opacity: 0.5 }}>{scenario.defences.length} defences</span>
      </div>
    </div>
  )
}
