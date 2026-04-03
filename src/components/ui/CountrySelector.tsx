import { Globe } from 'lucide-react'
import { COUNTRIES } from '../../data/countries'
import { useCountryStore } from '../../store/countryStore'

export function CountrySelector() {
  const selectedId = useCountryStore((s) => s.selectedCountryId)
  const setCountry = useCountryStore((s) => s.setCountry)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Globe size={12} style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Country
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={() => setCountry(null)}
          className="px-2 py-1.5 rounded-lg text-[9px] font-medium transition-all duration-150 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: selectedId === null ? 'var(--bg-active)' : 'var(--bg-element)',
            color: selectedId === null ? 'var(--accent)' : 'var(--text-muted)',
            border: `1px solid ${selectedId === null ? 'var(--border-active)' : 'var(--border)'}`,
          }}
        >
          None
        </button>
        {COUNTRIES.map((c) => {
          const isActive = selectedId === c.id
          return (
            <button
              key={c.id}
              onClick={() => setCountry(c.id)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-medium transition-all duration-150 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: isActive ? 'var(--bg-active)' : 'var(--bg-element)',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                border: `1px solid ${isActive ? 'var(--border-active)' : 'var(--border)'}`,
              }}
            >
              <span className="flex gap-px flex-shrink-0">
                {c.flagColors.map((fc, i) => (
                  <span
                    key={i}
                    className="w-1.5 h-3 first:rounded-l-sm last:rounded-r-sm"
                    style={{ background: fc }}
                  />
                ))}
              </span>
              <span className="truncate">{c.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
