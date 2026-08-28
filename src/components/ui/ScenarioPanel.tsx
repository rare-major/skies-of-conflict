import { useState } from 'react'
import { ArrowUpRight, Check, Save, Search, Trash2, Layers, Radar, Share2, Upload } from 'lucide-react'
import { useScenarioStore } from '../../store/scenarioStore'
import { useEntitySpawner } from '../../hooks/useEntitySpawner'
import { useEntityStore } from '../../store/entityStore'
import { useCountryStore } from '../../store/countryStore'
import { getCountryById, COUNTRIES } from '../../data/countries'
import { CountrySelector } from './CountrySelector'
import { IconButton } from './IconButton'
import type { Scenario } from '../../types/scenarios'

interface ScenarioPanelProps {
  onScenarioLoaded?: () => void
}

export function ScenarioPanel({ onScenarioLoaded }: ScenarioPanelProps) {
  const presets = useScenarioStore((s) => s.presets)
  const saved = useScenarioStore((s) => s.saved)
  const saveScenario = useScenarioStore((s) => s.saveScenario)
  const deleteSaved = useScenarioStore((s) => s.deleteSaved)
  const activeScenarioId = useScenarioStore((s) => s.activeScenarioId)
  const setActive = useScenarioStore((s) => s.setActive)
  const { loadScenario } = useEntitySpawner()
  const [saveName, setSaveName] = useState('')
  const [query, setQuery] = useState('')
  const [scenarioCode, setScenarioCode] = useState('')
  const [shareStatus, setShareStatus] = useState('')

  const selectedCountryId = useCountryStore((s) => s.selectedCountryId)
  const setCountry = useCountryStore((s) => s.setCountry)
  const country = selectedCountryId ? getCountryById(selectedCountryId) : null

  const matchesQuery = (scenario: Scenario) => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return true
    return `${scenario.name} ${scenario.description}`.toLowerCase().includes(normalized)
  }

  const countryScenarios = (country
    ? presets.filter((s) => country.scenarioIds.includes(s.id))
    : []).filter(matchesQuery)
  const genericScenarios = (country
    ? presets.filter((s) => !country.scenarioIds.includes(s.id))
    : presets).filter(matchesQuery)
  const savedScenarios = saved.filter(matchesQuery)

  const handleLoadScenario = (scenario: Scenario) => {
    if (!selectedCountryId) {
      const match = COUNTRIES.find((c) => c.scenarioIds.includes(scenario.id))
      if (match) setCountry(match.id)
    }
    loadScenario(scenario)
    setActive(scenario.id)
    onScenarioLoaded?.()
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
          type: e.type,
          trajectory: e.trajectory,
          position: e.position,
          velocity: e.velocity,
          isDecoy: e.isDecoy,
          launchDelay: e.activationTime,
          waypoints: e.waypoints,
          params: e.params,
        })),
      defences: entities
        .filter((e) => e.kind === 'defence')
        .map((e) => ({
          type: e.type,
          trajectory: e.trajectory,
          position: e.position,
          presetId: e.presetId,
          facing: e.facing,
          params: e.params,
        })),
    }
    saveScenario(scenario)
    setActive(scenario.id)
    setSaveName('')
  }

  const importScenario = () => {
    try {
      const imported = decodeScenario(scenarioCode)
      const scenario = { ...imported, id: crypto.randomUUID(), name: `${imported.name} · Imported` }
      saveScenario(scenario)
      setActive(scenario.id)
      setShareStatus('Scenario package authenticated and added to the mission library.')
    } catch {
      setShareStatus('That scenario package is invalid or incomplete.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="mission-library-heading">
        <span className="mission-library-heading__icon"><Radar size={18} /></span>
        <div>
          <span>Scenario archive</span>
          <h2>Mission library</h2>
          <p>Stage a curated engagement package, then take command.</p>
        </div>
        <strong>{presets.length.toString().padStart(2, '0')}</strong>
      </div>

      <CountrySelector />

      <label className="scenario-search">
        <Search size={14} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search missions, aircraft, threats..."
          aria-label="Search scenarios"
        />
      </label>

      {/* Country scenarios */}
      {countryScenarios.length > 0 && (
        <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="scenario-section-heading">
            <Layers size={12} style={{ color: 'var(--accent)' }} />
            <h3 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              {country?.name} Scenarios
            </h3>
          </div>
          {countryScenarios.map((scenario, index) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              sequence={index + 1}
              active={scenario.id === activeScenarioId}
              onLoad={() => handleLoadScenario(scenario)}
            />
          ))}
        </div>
      )}

      {/* Generic / all scenarios */}
      <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="scenario-section-heading">
          <Layers size={12} style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {country ? 'Other Scenarios' : 'Presets'}
          </h3>
        </div>
        {genericScenarios.map((scenario, index) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            sequence={index + 1}
            active={scenario.id === activeScenarioId}
            onLoad={() => handleLoadScenario(scenario)}
          />
        ))}
        {genericScenarios.length === 0 && countryScenarios.length === 0 && (
          <p className="py-6 text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
            No missions match “{query}”.
          </p>
        )}
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
          <IconButton icon={Save} onClick={handleSave} tooltip="Save the current force setup as a custom scenario." />
        </div>
      </div>

      {savedScenarios.length > 0 && (
        <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <h3 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Saved ({savedScenarios.length})
          </h3>
          {savedScenarios.map((scenario, index) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              sequence={index + 1}
              active={scenario.id === activeScenarioId}
              onLoad={() => handleLoadScenario(scenario)}
              onDelete={() => {
                deleteSaved(scenario.id)
                if (activeScenarioId === scenario.id) setActive(null)
              }}
              onShare={() => { setScenarioCode(encodeScenario(scenario)); setShareStatus(`Share package generated for ${scenario.name}.`) }}
            />
          ))}
        </div>
      )}

      <div className="scenario-share-card">
        <div><Share2 size={13} /><span><strong>Scenario exchange</strong><small>Portable missions include forces, parameters, seed and authored routes.</small></span></div>
        <textarea value={scenarioCode} onChange={(event) => setScenarioCode(event.target.value)} placeholder="Paste a SKYSCN mission package…" />
        <button onClick={importScenario} disabled={!scenarioCode.trim()}><Upload size={12} />Import mission</button>
        {shareStatus && <p>{shareStatus}</p>}
      </div>
    </div>
  )
}

function ScenarioCard({ scenario, sequence, active = false, onLoad, onDelete, onShare }: {
  scenario: Scenario; sequence: number; active?: boolean; onLoad: () => void; onDelete?: () => void; onShare?: () => void
}) {
  const threatLevel = scenario.attacks.length >= 12
    ? 'Critical'
    : scenario.attacks.length >= 7
      ? 'Severe'
      : 'Guarded'

  return (
    <div
      className="scenario-card group"
      style={{
        background: active ? 'var(--bg-active)' : 'var(--bg-element)',
        border: `1px solid ${active ? 'var(--border-active)' : 'var(--border)'}`,
      }}
    >
      <div className="scenario-card__header">
        <div className="scenario-card__title">
          <span>{sequence.toString().padStart(2, '0')}</span>
          <div>
            <small>{threatLevel} threat</small>
            <h4>{scenario.name}</h4>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onLoad}
            className="scenario-deploy-button"
            style={{ background: active ? 'var(--accent-solid)' : 'var(--bg-active)', color: active ? '#fff' : 'var(--accent)' }}
          >
            {active && <Check size={11} />}
            {active ? 'Staged' : 'Stage'}
            {!active && <ArrowUpRight size={11} />}
          </button>
          {onDelete && (
            <button onClick={onShare} aria-label={`Share ${scenario.name}`} className="scenario-icon-button"><Share2 size={10} /></button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              aria-label={`Delete ${scenario.name}`}
              className="flex min-h-7 min-w-7 items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150 cursor-pointer"
              style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)' }}
            >
              <Trash2 size={10} />
            </button>
          )}
        </div>
      </div>
      <p className="scenario-card__description">{scenario.description}</p>
      <div className="scenario-card__metrics">
        <span><i className="is-threat" /> {scenario.attacks.length} hostile tracks</span>
        <span><i className="is-defence" /> {scenario.defences.length} defence systems</span>
      </div>
    </div>
  )
}

function encodeScenario(scenario: Scenario) {
  const bytes = new TextEncoder().encode(JSON.stringify({ version: 1, scenario }))
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return `SKYSCN1-${btoa(binary)}`
}

function decodeScenario(code: string): Scenario {
  const encoded = code.trim().replace(/^SKYSCN1-/, '')
  const binary = atob(encoded)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  const value = JSON.parse(new TextDecoder().decode(bytes)) as { scenario?: Scenario }
  if (!value.scenario || !Array.isArray(value.scenario.attacks) || !Array.isArray(value.scenario.defences)) throw new Error('Invalid scenario')
  return value.scenario
}
