import type { AttackCatalogItem, DefenceCatalogItem, GameModeDefinition, IntelLevel, ModeOperation } from '../types/game'

export const GAME_MODES: GameModeDefinition[] = [
  { id: 'duel', name: 'Commander vs Commander', eyebrow: 'Asymmetric hot-seat', description: 'Build secret strike and defence plans, commit simultaneously, then watch the engagement resolve.', status: 'ready', players: '2 players' },
  { id: 'survival', name: 'Last Light', eyebrow: 'Escalation survival', description: 'Hold the airspace through increasingly sophisticated attack waves with finite ammunition.', status: 'ready', players: '1 player' },
  { id: 'coop', name: 'Joint Command', eyebrow: 'Sector co-op', description: 'Split radar, interceptor and point-defence responsibilities across one shared battlespace.', status: 'ready', players: '2 players' },
  { id: 'puzzle', name: 'Tactical Problems', eyebrow: 'Constraint missions', description: 'Solve authored defence and penetration challenges with restricted equipment and budgets.', status: 'ready', players: '1 player' },
  { id: 'campaign', name: 'The Long War', eyebrow: 'Persistent theatre', description: 'Carry surviving systems, losses, intelligence and territory across a chain of operations.', status: 'ready', players: '1–2 players' },
  { id: 'tournament', name: 'War Games', eyebrow: 'Competitive bracket', description: 'Standard maps, fixed seeds and mirrored budgets designed for repeatable competitive play.', status: 'ready', players: '2 players' },
  { id: 'async', name: 'Dead Drop', eyebrow: 'Asynchronous plans', description: 'Save an encrypted-feeling command package for another player to resolve later.', status: 'ready', players: '2 players' },
]

export const ATTACK_CATALOG: AttackCatalogItem[] = [
  { id: 'rocket', side: 'attack', label: 'Unguided Rocket', category: 'Saturation', description: 'Cheap mass for exhausting short-range interceptors.', cost: 35, maxCount: 12, type: 'rocket', trajectory: 'ballistic' },
  { id: 'swarm-drone', side: 'attack', label: 'Swarm Drone', category: 'Drone', description: 'Low-cost autonomous threat that becomes dangerous in numbers.', cost: 45, maxCount: 10, type: 'swarm-drone', trajectory: 'swarm' },
  { id: 'decoy', side: 'attack', label: 'Radar Decoy', category: 'Deception', description: 'Creates a convincing false track and wastes defensive attention.', cost: 30, maxCount: 8, type: 'decoy', trajectory: 'straight' },
  { id: 'kamikaze-drone', side: 'attack', label: 'Kamikaze Drone', category: 'Drone', description: 'Terrain-hugging precision threat with a terminal dive.', cost: 75, maxCount: 6, type: 'kamikaze-drone', trajectory: 'dive' },
  { id: 'cruise-missile', side: 'attack', label: 'Cruise Missile', category: 'Precision', description: 'Low-altitude guided weapon with a compact radar signature.', cost: 130, maxCount: 6, type: 'cruise-missile', trajectory: 'cruise' },
  { id: 'anti-radiation-missile', side: 'attack', label: 'Anti-Radiation Missile', category: 'Suppression', description: 'Fast radar-homing weapon for opening a corridor.', cost: 150, maxCount: 4, type: 'anti-radiation-missile', trajectory: 'straight' },
  { id: 'ballistic-missile', side: 'attack', label: 'Ballistic Missile', category: 'Strategic', description: 'High-speed arcing threat that stresses the upper layer.', cost: 210, maxCount: 4, type: 'ballistic-missile', trajectory: 'ballistic' },
  { id: 'stealth-drone', side: 'attack', label: 'Stealth Drone', category: 'Low observable', description: 'Difficult to detect until it is deep inside the network.', cost: 165, maxCount: 4, type: 'stealth-drone', trajectory: 'cruise' },
  { id: 'fighter-jet', side: 'attack', label: 'Strike Fighter', category: 'Aircraft', description: 'Fast, manoeuvrable platform capable of evasive penetration.', cost: 260, maxCount: 3, type: 'fighter-jet', trajectory: 'zigzag' },
  { id: 'ew-aircraft', side: 'attack', label: 'EW Aircraft', category: 'Electronic warfare', description: 'Degrades detection ranges and creates an attack corridor.', cost: 280, maxCount: 2, type: 'ew-aircraft', trajectory: 'loitering' },
  { id: 'hypersonic-glide', side: 'attack', label: 'Hypersonic Glide Vehicle', category: 'Strategic', description: 'Extremely fast manoeuvring threat with little reaction time.', cost: 360, maxCount: 2, type: 'hypersonic-glide', trajectory: 'ballistic' },
  { id: 'stealth-aircraft', side: 'attack', label: 'Stealth Aircraft', category: 'Low observable', description: 'Premium penetrating aircraft with a very low radar signature.', cost: 420, maxCount: 2, type: 'stealth-aircraft', trajectory: 'cruise' },
]

export const DEFENCE_CATALOG: DefenceCatalogItem[] = [
  { id: 'aa-gun', side: 'defence', label: 'Anti-Aircraft Gun', category: 'Gun layer', description: 'Cheap all-aspect protection against slow, close threats.', cost: 55, maxCount: 5, type: 'aa-gun', trajectory: 'burst-fire', presetId: 'aa-gun' },
  { id: 'anti-drone-gun', side: 'defence', label: 'Counter-Drone Gun', category: 'Counter-UAS', description: 'Short-range specialist for drone-heavy strike packages.', cost: 75, maxCount: 5, type: 'anti-drone-gun', trajectory: 'burst-fire', presetId: 'anti-drone-gun' },
  { id: 'ciws', side: 'defence', label: 'CIWS', category: 'Point defence', description: 'Last-ditch high-rate protection around the objective.', cost: 105, maxCount: 4, type: 'ciws', trajectory: 'burst-fire', presetId: 'ciws' },
  { id: 'signal-jammer', side: 'defence', label: 'Signal Jammer', category: 'Electronic warfare', description: 'Disrupts guidance and complicates coordinated drone attacks.', cost: 120, maxCount: 2, type: 'signal-jammer', trajectory: 'direct-intercept', presetId: 'signal-jammer' },
  { id: 'iron-dome', side: 'defence', label: 'Short-Range SAM', category: 'Inner layer', description: 'High-capacity system optimized for rockets and drones.', cost: 150, maxCount: 4, type: 'short-range-sam', trajectory: 'predictive-intercept', presetId: 'iron-dome' },
  { id: 'nasams', side: 'defence', label: 'Medium-Range SAM', category: 'Middle layer', description: 'Balanced coverage against aircraft and cruise missiles.', cost: 220, maxCount: 4, type: 'medium-range-sam', trajectory: 'radar-guided', presetId: 'nasams' },
  { id: 'buk', side: 'defence', label: 'Mobile Medium SAM', category: 'Middle layer', description: 'Mobile radar-guided layer with strong multi-target coverage.', cost: 235, maxCount: 3, type: 'medium-range-sam', trajectory: 'proportional-nav', presetId: 'buk' },
  { id: 'patriot', side: 'defence', label: 'Patriot Battery', category: 'Outer layer', description: 'Long-range precision defence against fast strategic threats.', cost: 330, maxCount: 3, type: 'long-range-sam', trajectory: 'predictive-intercept', presetId: 'patriot' },
  { id: 's-400', side: 'defence', label: 'S-400 Battery', category: 'Outer layer', description: 'Very long-range radar coverage and high-altitude engagement.', cost: 370, maxCount: 2, type: 'long-range-sam', trajectory: 'proportional-nav', presetId: 's-400' },
]

export const INTEL_COSTS: Record<IntelLevel, number> = {
  none: 0,
  signals: 80,
  'full-spectrum': 170,
}

const layeredDefence = {
  formation: 'layered', radarPolicy: 'networked', engagementPriority: 'time-to-impact', salvoPolicy: 'balanced', reservePercent: 10,
} as const

const standardStrike = {
  approach: 'west', formation: 'multi-axis', waveTiming: 'simultaneous', altitude: 'medium', targetPriority: 'command',
} as const

export const MODE_OPERATIONS: ModeOperation[] = [
  {
    id: 'survival-cadet', mode: 'survival', name: 'First Watch', eyebrow: 'Three-wave survival', difficulty: 'Cadet', countryId: 'uk',
    description: 'Hold through drones, rockets and a final cruise-missile wave with a balanced defensive group.',
    defenceForce: [{ assetId: 'nasams', count: 2 }, { assetId: 'iron-dome', count: 2 }, { assetId: 'ciws', count: 2 }],
    attackForce: [{ assetId: 'swarm-drone', count: 5 }, { assetId: 'rocket', count: 5 }, { assetId: 'cruise-missile', count: 3 }],
    defenceDoctrine: layeredDefence, attackDoctrine: { ...standardStrike, waveTiming: 'staggered' },
  },
  {
    id: 'survival-veteran', mode: 'survival', name: 'Black Sky', eyebrow: 'Four-wave survival', difficulty: 'Veteran', countryId: 'usa',
    description: 'A sustained mixed raid escalates from decoys and drones to ballistic weapons and electronic attack.',
    defenceForce: [{ assetId: 'patriot', count: 1 }, { assetId: 'nasams', count: 2 }, { assetId: 'iron-dome', count: 2 }, { assetId: 'ciws', count: 2 }],
    attackForce: [{ assetId: 'decoy', count: 4 }, { assetId: 'swarm-drone', count: 5 }, { assetId: 'cruise-missile', count: 4 }, { assetId: 'ballistic-missile', count: 2 }],
    defenceDoctrine: { ...layeredDefence, reservePercent: 20 }, attackDoctrine: { ...standardStrike, waveTiming: 'feint-first' },
  },
  {
    id: 'survival-nightmare', mode: 'survival', name: 'Last Light', eyebrow: 'Maximum escalation', difficulty: 'Nightmare', countryId: 'japan',
    description: 'Decoys, swarm drones, electronic warfare, cruise missiles and hypersonic weapons arrive in coordinated waves.',
    defenceForce: [{ assetId: 'patriot', count: 2 }, { assetId: 'nasams', count: 2 }, { assetId: 'iron-dome', count: 3 }, { assetId: 'ciws', count: 2 }, { assetId: 'signal-jammer', count: 1 }],
    attackForce: [{ assetId: 'decoy', count: 4 }, { assetId: 'swarm-drone', count: 6 }, { assetId: 'cruise-missile', count: 4 }, { assetId: 'ew-aircraft', count: 1 }, { assetId: 'hypersonic-glide', count: 2 }],
    defenceDoctrine: { ...layeredDefence, reservePercent: 25 }, attackDoctrine: { ...standardStrike, waveTiming: 'feint-first', formation: 'saturation' },
  },
  {
    id: 'coop-joint-shield', mode: 'coop', name: 'Joint Shield', eyebrow: 'Two-sector command', difficulty: 'Veteran', countryId: 'france',
    description: 'Player one owns the radar and outer layer; player two owns the inner layer and terminal defence.',
    defenceForce: [{ assetId: 'patriot', count: 1 }, { assetId: 'nasams', count: 2 }, { assetId: 'iron-dome', count: 2 }, { assetId: 'ciws', count: 2 }, { assetId: 'signal-jammer', count: 1 }],
    attackForce: [{ assetId: 'anti-radiation-missile', count: 2 }, { assetId: 'cruise-missile', count: 4 }, { assetId: 'swarm-drone', count: 5 }, { assetId: 'ballistic-missile', count: 2 }],
    defenceDoctrine: layeredDefence, attackDoctrine: { ...standardStrike, formation: 'saturation' },
  },
  {
    id: 'puzzle-saturation', mode: 'puzzle', name: 'Twelve Tracks, Four Launchers', eyebrow: 'Interceptor economy', difficulty: 'Cadet', countryId: 'israel',
    description: 'Choose a doctrine that prevents cheap rockets and decoys from exhausting a compact defensive grid.',
    defenceForce: [{ assetId: 'iron-dome', count: 2 }, { assetId: 'nasams', count: 1 }, { assetId: 'ciws', count: 1 }],
    attackForce: [{ assetId: 'rocket', count: 7 }, { assetId: 'decoy', count: 3 }, { assetId: 'cruise-missile', count: 2 }],
    defenceDoctrine: { ...layeredDefence, salvoPolicy: 'conserve', reservePercent: 15 }, attackDoctrine: { ...standardStrike, formation: 'saturation' },
  },
  {
    id: 'puzzle-silent-corridor', mode: 'puzzle', name: 'The Silent Corridor', eyebrow: 'Radar posture', difficulty: 'Veteran', countryId: 'turkey',
    description: 'Stealth tracks approach behind anti-radiation missiles. Radar timing decides whether the network survives.',
    defenceForce: [{ assetId: 'patriot', count: 1 }, { assetId: 'nasams', count: 2 }, { assetId: 'ciws', count: 1 }],
    attackForce: [{ assetId: 'anti-radiation-missile', count: 2 }, { assetId: 'stealth-drone', count: 3 }, { assetId: 'cruise-missile', count: 2 }],
    defenceDoctrine: { ...layeredDefence, radarPolicy: 'silent-watch' }, attackDoctrine: { ...standardStrike, formation: 'low-observable' },
  },
  {
    id: 'puzzle-decoy-calculus', mode: 'puzzle', name: 'Decoy Calculus', eyebrow: 'Threat identification', difficulty: 'Nightmare', countryId: 'russia',
    description: 'A deceptive first wave masks high-value ballistic tracks. Conserve the long-range layer for real threats.',
    defenceForce: [{ assetId: 's-400', count: 1 }, { assetId: 'buk', count: 2 }, { assetId: 'ciws', count: 2 }],
    attackForce: [{ assetId: 'decoy', count: 6 }, { assetId: 'ballistic-missile', count: 3 }, { assetId: 'cruise-missile', count: 3 }],
    defenceDoctrine: { ...layeredDefence, salvoPolicy: 'conserve', reservePercent: 30 }, attackDoctrine: { ...standardStrike, waveTiming: 'feint-first' },
  },
  {
    id: 'campaign-border', mode: 'campaign', name: '01 · Border Echo', eyebrow: 'Opening operation', difficulty: 'Cadet', countryId: 'india',
    campaignId: 'glass-horizon',
    description: 'Defeat a reconnaissance-in-force and preserve ammunition for the operations ahead.',
    defenceForce: [{ assetId: 'nasams', count: 2 }, { assetId: 'iron-dome', count: 2 }, { assetId: 'ciws', count: 1 }],
    attackForce: [{ assetId: 'swarm-drone', count: 5 }, { assetId: 'cruise-missile', count: 2 }, { assetId: 'decoy', count: 2 }],
    defenceDoctrine: layeredDefence, attackDoctrine: standardStrike,
  },
  {
    id: 'campaign-suppression', mode: 'campaign', name: '02 · Broken Spectrum', eyebrow: 'Suppression operation', difficulty: 'Veteran', countryId: 'india',
    campaignId: 'glass-horizon',
    description: 'Electronic warfare and anti-radiation weapons attempt to dismantle the surviving radar network.',
    defenceForce: [{ assetId: 'patriot', count: 1 }, { assetId: 'nasams', count: 2 }, { assetId: 'iron-dome', count: 2 }, { assetId: 'signal-jammer', count: 1 }],
    attackForce: [{ assetId: 'ew-aircraft', count: 1 }, { assetId: 'anti-radiation-missile', count: 3 }, { assetId: 'cruise-missile', count: 4 }, { assetId: 'decoy', count: 3 }],
    defenceDoctrine: { ...layeredDefence, radarPolicy: 'silent-watch' }, attackDoctrine: { ...standardStrike, waveTiming: 'feint-first' },
  },
  {
    id: 'campaign-siege', mode: 'campaign', name: '03 · Capital Siege', eyebrow: 'Final operation', difficulty: 'Nightmare', countryId: 'india',
    campaignId: 'glass-horizon',
    description: 'The full strike package commits against the capital in a decisive multi-domain engagement.',
    defenceForce: [{ assetId: 's-400', count: 1 }, { assetId: 'nasams', count: 2 }, { assetId: 'iron-dome', count: 3 }, { assetId: 'ciws', count: 2 }, { assetId: 'signal-jammer', count: 1 }],
    attackForce: [{ assetId: 'decoy', count: 4 }, { assetId: 'swarm-drone', count: 5 }, { assetId: 'cruise-missile', count: 4 }, { assetId: 'ballistic-missile', count: 3 }, { assetId: 'hypersonic-glide', count: 1 }],
    defenceDoctrine: layeredDefence, attackDoctrine: { ...standardStrike, formation: 'saturation', waveTiming: 'feint-first' },
  },
  {
    id: 'midnight-watch', mode: 'campaign', campaignId: 'midnight-lance', name: '01 · Polar Watch', eyebrow: 'Night interception', difficulty: 'Cadet', countryId: 'uk',
    description: 'A cold-war-inspired night watch begins with uncertain bomber, decoy and cruise-missile tracks crossing a northern corridor.',
    defenceForce: [{ assetId: 'patriot', count: 1 }, { assetId: 'nasams', count: 2 }, { assetId: 'ciws', count: 2 }],
    attackForce: [{ assetId: 'decoy', count: 4 }, { assetId: 'cruise-missile', count: 4 }, { assetId: 'fighter-jet', count: 1 }],
    defenceDoctrine: { ...layeredDefence, radarPolicy: 'silent-watch', reservePercent: 25 }, attackDoctrine: { ...standardStrike, approach: 'north', waveTiming: 'feint-first' },
  },
  {
    id: 'midnight-breaker', mode: 'campaign', campaignId: 'midnight-lance', name: '02 · Line Breaker', eyebrow: 'Magazine crisis', difficulty: 'Nightmare', countryId: 'uk',
    description: 'Limited magazines face a sustained strategic raid while electronic attack erodes the common operating picture.',
    defenceForce: [{ assetId: 'patriot', count: 1 }, { assetId: 'nasams', count: 2 }, { assetId: 'iron-dome', count: 1 }, { assetId: 'signal-jammer', count: 1 }],
    attackForce: [{ assetId: 'ew-aircraft', count: 1 }, { assetId: 'ballistic-missile', count: 3 }, { assetId: 'cruise-missile', count: 5 }, { assetId: 'decoy', count: 3 }],
    defenceDoctrine: { ...layeredDefence, salvoPolicy: 'conserve', reservePercent: 35 }, attackDoctrine: { ...standardStrike, approach: 'north', formation: 'saturation', waveTiming: 'staggered' },
  },
  {
    id: 'ember-crossing', mode: 'campaign', campaignId: 'ember-strait', name: '01 · Strait Crossing', eyebrow: 'Maritime opening', difficulty: 'Veteran', countryId: 'turkey',
    description: 'A fictional maritime strike probes coastal air defence with sea-skimming weapons, drones and radar decoys.',
    defenceForce: [{ assetId: 'nasams', count: 2 }, { assetId: 'iron-dome', count: 2 }, { assetId: 'ciws', count: 2 }, { assetId: 'signal-jammer', count: 1 }],
    attackForce: [{ assetId: 'cruise-missile', count: 5 }, { assetId: 'swarm-drone', count: 5 }, { assetId: 'decoy', count: 3 }],
    defenceDoctrine: layeredDefence, attackDoctrine: { ...standardStrike, approach: 'south', altitude: 'nap-of-earth', formation: 'multi-axis' },
  },
  {
    id: 'ember-carrier', mode: 'campaign', campaignId: 'ember-strait', name: '02 · Carrier Shadow', eyebrow: 'Multi-domain finale', difficulty: 'Nightmare', countryId: 'turkey',
    description: 'Carrier aviation and electronic attack coordinate a final saturation package across the contested strait.',
    defenceForce: [{ assetId: 'patriot', count: 1 }, { assetId: 'nasams', count: 2 }, { assetId: 'iron-dome', count: 2 }, { assetId: 'ciws', count: 2 }, { assetId: 'signal-jammer', count: 1 }],
    attackForce: [{ assetId: 'fighter-jet', count: 2 }, { assetId: 'ew-aircraft', count: 1 }, { assetId: 'anti-radiation-missile', count: 3 }, { assetId: 'cruise-missile', count: 5 }, { assetId: 'swarm-drone', count: 4 }],
    defenceDoctrine: { ...layeredDefence, reservePercent: 25 }, attackDoctrine: { ...standardStrike, approach: 'south', formation: 'saturation', waveTiming: 'feint-first' },
  },
]
