import { create } from 'zustand'

interface CountryStore {
  selectedCountryId: string | null
  setCountry: (id: string | null) => void
}

export const useCountryStore = create<CountryStore>((set) => ({
  selectedCountryId: null,
  setCountry: (selectedCountryId) => set({ selectedCountryId }),
}))
