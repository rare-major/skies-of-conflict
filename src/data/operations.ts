import type { AiCommanderId, CampaignTheatre, WeatherPreset } from '../types/operations'
import type { ModeOperation } from '../types/game'

export interface AiCommanderDefinition {
  id: AiCommanderId
  name: string
  callsign: string
  description: string
  trait: string
}

export const AI_COMMANDERS: AiCommanderDefinition[] = [
  { id: 'adaptive', name: 'Astra', callsign: 'MIRROR', description: 'Reads the battlespace and shifts priorities as the engagement develops.', trait: 'Balanced detection, timing and target selection' },
  { id: 'aggressive', name: 'Viper', callsign: 'REDLINE', description: 'Compresses decision time and spends ammunition to seize the initiative.', trait: 'Faster reactions, higher ammunition expenditure' },
  { id: 'deceptive', name: 'Nox', callsign: 'GHOST', description: 'Uses decoys, feints and delayed waves to create false conclusions.', trait: 'Stronger decoys and irregular launch timing' },
  { id: 'saturation', name: 'Rook', callsign: 'ANVIL', description: 'Concentrates mass against one corridor until the defence breaks.', trait: 'Dense formations and coordinated time-on-target' },
  { id: 'stealth', name: 'Shade', callsign: 'VEIL', description: 'Prioritizes low observable platforms, terrain masking and emissions control.', trait: 'Reduced signatures and later classification' },
]

export const WEATHER_LABELS: Record<WeatherPreset, { name: string; detail: string }> = {
  clear: { name: 'Clear', detail: 'Maximum visibility and sensor performance' },
  overcast: { name: 'Overcast', detail: 'Flat light with moderate optical degradation' },
  storm: { name: 'Storm front', detail: 'Turbulence, lightning and unstable tracks' },
  monsoon: { name: 'Monsoon', detail: 'Heavy rain and substantial radar clutter' },
  dust: { name: 'Dust veil', detail: 'Low visibility and degraded electro-optics' },
}

export const CAMPAIGN_THEATRES: CampaignTheatre[] = [
  { id: 'glass-horizon', name: 'Glass Horizon', era: 'Near future · 2032', description: 'A fictional border crisis escalates from reconnaissance probes into a contested capital siege.', tone: '#65d6ff', operations: 3 },
  { id: 'midnight-lance', name: 'Midnight Lance', era: 'Cold-war inspired', description: 'Night interceptions, emission discipline and limited magazines define a tense northern air corridor.', tone: '#a8b8ff', operations: 2 },
  { id: 'ember-strait', name: 'Ember Strait', era: 'Fictional maritime theatre', description: 'Carrier aviation, coastal missiles and electronic attack collide across a narrow strategic passage.', tone: '#ffae72', operations: 2 },
]

function hashDate(value: string) {
  let hash = 2166136261
  for (const char of value) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function getDailyOperation(date = new Date()): ModeOperation & { seed: number; challengeDate: string } {
  const challengeDate = date.toISOString().slice(0, 10)
  const seed = 10000 + (hashDate(challengeDate) % 89999)
  const rotation = seed % 3
  const countryId = ['india', 'japan', 'france'][rotation]
  const attackForce = rotation === 0
    ? [{ assetId: 'swarm-drone', count: 5 }, { assetId: 'cruise-missile', count: 3 }, { assetId: 'decoy', count: 3 }]
    : rotation === 1
      ? [{ assetId: 'ballistic-missile', count: 2 }, { assetId: 'cruise-missile', count: 4 }, { assetId: 'ew-aircraft', count: 1 }]
      : [{ assetId: 'anti-radiation-missile', count: 2 }, { assetId: 'stealth-drone', count: 4 }, { assetId: 'fighter-jet', count: 1 }]

  return {
    id: `daily-${challengeDate}`,
    mode: 'puzzle',
    name: `Daily Directive · ${challengeDate}`,
    eyebrow: 'Global seeded challenge',
    description: 'Every commander receives the same theatre, forces and deterministic combat seed for the day.',
    difficulty: rotation === 2 ? 'Nightmare' : rotation === 1 ? 'Veteran' : 'Cadet',
    countryId,
    defenceForce: [{ assetId: 'patriot', count: 1 }, { assetId: 'nasams', count: 2 }, { assetId: 'iron-dome', count: 2 }, { assetId: 'ciws', count: 1 }],
    attackForce,
    defenceDoctrine: { formation: 'layered', radarPolicy: 'networked', engagementPriority: 'time-to-impact', salvoPolicy: 'balanced', reservePercent: 20 },
    attackDoctrine: { approach: rotation === 1 ? 'north' : 'west', formation: rotation === 0 ? 'saturation' : 'multi-axis', waveTiming: 'feint-first', altitude: rotation === 2 ? 'nap-of-earth' : 'medium', targetPriority: 'radar' },
    seed,
    challengeDate,
  }
}
