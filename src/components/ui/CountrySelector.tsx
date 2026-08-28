import { Globe } from 'lucide-react'
import { COUNTRIES, type Country } from '../../data/countries'
import { useCountryStore } from '../../store/countryStore'

export function CountrySelector() {
  const selectedId = useCountryStore((s) => s.selectedCountryId)
  const setCountry = useCountryStore((s) => s.setCountry)

  return (
    <div className="country-selector">
      <div className="section-heading">
        <Globe size={12} style={{ color: 'var(--text-muted)' }} />
        <div><span>Operational map</span><h3>Theatre</h3></div>
      </div>

      <div className="country-grid">
        <button
          onClick={() => setCountry(null)}
          aria-pressed={selectedId === null}
          className="country-button"
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
              aria-pressed={isActive}
              className="country-button"
              style={{
                background: isActive ? 'var(--bg-active)' : 'var(--bg-element)',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                border: `1px solid ${isActive ? 'var(--border-active)' : 'var(--border)'}`,
              }}
            >
              <CountryFlag country={c} />
              <span className="truncate">{c.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CountryFlag({ country }: { country: Country }) {
  if (country.id === 'india') {
    return (
      <span className="country-flag country-flag--india" aria-hidden="true">
        <span className="country-flag__chakra" />
      </span>
    )
  }

  return (
    <span className="country-flag country-flag--columns" aria-hidden="true">
      {country.flagColors.map((color, index) => (
        <span key={index} style={{ background: color }} />
      ))}
    </span>
  )
}
