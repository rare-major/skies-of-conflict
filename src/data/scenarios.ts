import type { Scenario } from '../types/scenarios'

export const PRESET_SCENARIOS: Scenario[] = [
  // ─── EXISTING GENERIC SCENARIOS ───────────────────────────────────────
  {
    id: 'drone-swarm',
    name: 'Drone Swarm Attack',
    description: '12 swarm drones converge on a defended position protected by short-range SAMs and anti-drone systems.',
    attacks: [
      ...Array.from({ length: 12 }, (_, i) => ({
        type: 'swarm-drone' as const,
        trajectory: 'swarm' as const,
        position: [
          -400 + (i % 4) * 30,
          60 + Math.floor(i / 4) * 10,
          -300 + Math.floor(i / 4) * 20,
        ] as [number, number, number],
        velocity: [40, 0, 30] as [number, number, number],
      })),
    ],
    defences: [
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [0, 0, 0] },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [50, 0, 30] },
      { type: 'anti-drone-gun', trajectory: 'direct-intercept', position: [-30, 0, 20] },
      { type: 'anti-drone-gun', trajectory: 'burst-fire', position: [30, 0, -20] },
      { type: 'ciws', trajectory: 'burst-fire', position: [0, 0, 50] },
    ],
  },
  {
    id: 'missile-intercept',
    name: 'Missile Interception Test',
    description: '3 ballistic missiles vs long-range S-400 and Patriot-like defence systems.',
    attacks: [
      { type: 'ballistic-missile', trajectory: 'ballistic', position: [-500, 20, -200], velocity: [150, 120, 60] },
      { type: 'ballistic-missile', trajectory: 'ballistic', position: [-450, 20, 0], velocity: [140, 130, 20] },
      { type: 'ballistic-missile', trajectory: 'ballistic', position: [-480, 20, 200], velocity: [145, 110, -40] },
    ],
    defences: [
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [100, 0, 0] },
      { type: 'long-range-sam', trajectory: 'predictive-intercept', position: [50, 0, 100] },
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [0, 0, -50] },
    ],
  },
  {
    id: 'fighter-vs-sam',
    name: 'Fighter Jet vs SAM',
    description: '2 fighter jets with evasive maneuvers against layered SAM defence.',
    attacks: [
      { type: 'fighter-jet', trajectory: 'zigzag', position: [-400, 100, -100], velocity: [160, 0, 50] },
      { type: 'fighter-jet', trajectory: 'zigzag', position: [-380, 120, 100], velocity: [150, 0, -30] },
    ],
    defences: [
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [100, 0, 0] },
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [0, 0, -80] },
      { type: 'medium-range-sam', trajectory: 'proportional-nav', position: [0, 0, 80] },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [-50, 0, 0] },
      { type: 'aa-gun', trajectory: 'burst-fire', position: [20, 0, 20] },
    ],
  },
  {
    id: 'mixed-attack',
    name: 'Mixed Attack',
    description: 'Cruise missiles, kamikaze drones, and decoys overwhelm a full defence stack with EW support.',
    attacks: [
      { type: 'cruise-missile', trajectory: 'cruise', position: [-500, 15, -100], velocity: [80, 0, 20] },
      { type: 'cruise-missile', trajectory: 'cruise', position: [-480, 18, 100], velocity: [75, 0, -15] },
      { type: 'kamikaze-drone', trajectory: 'dive', position: [-350, 80, -50], velocity: [50, 0, 30] },
      { type: 'kamikaze-drone', trajectory: 'dive', position: [-360, 90, 60], velocity: [55, 0, -20] },
      { type: 'kamikaze-drone', trajectory: 'dive', position: [-340, 70, 0], velocity: [60, 0, 10] },
      { type: 'decoy', trajectory: 'straight', position: [-400, 50, -150], velocity: [60, 0, 40] },
      { type: 'decoy', trajectory: 'straight', position: [-420, 55, 150], velocity: [55, 0, -35] },
      { type: 'decoy', trajectory: 'straight', position: [-410, 45, 0], velocity: [65, 0, 5] },
      { type: 'ew-aircraft', trajectory: 'loitering', position: [-300, 100, 0], velocity: [30, 0, 10] },
    ],
    defences: [
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [100, 0, 0] },
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [30, 0, -60] },
      { type: 'medium-range-sam', trajectory: 'proportional-nav', position: [30, 0, 60] },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [0, 0, 0] },
      { type: 'ciws', trajectory: 'burst-fire', position: [-20, 0, 20] },
      { type: 'signal-jammer', trajectory: 'direct-intercept', position: [0, 0, -30] },
      { type: 'aa-gun', trajectory: 'burst-fire', position: [10, 0, -10] },
    ],
  },

  // ─── NEW GENERIC SCENARIOS ────────────────────────────────────────────
  {
    id: 'hypersonic-strike',
    name: 'Hypersonic Strike',
    description: '3 hypersonic glide vehicles challenge layered SAM defences with extreme speed.',
    attacks: [
      { type: 'hypersonic-glide', trajectory: 'ballistic', position: [-500, 80, -150], velocity: [250, 60, 40] },
      { type: 'hypersonic-glide', trajectory: 'ballistic', position: [-520, 90, 0], velocity: [260, 55, 10] },
      { type: 'hypersonic-glide', trajectory: 'ballistic', position: [-480, 70, 150], velocity: [240, 65, -30] },
    ],
    defences: [
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [100, 0, 0] },
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [50, 0, -100] },
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [0, 0, 50] },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [-20, 0, 0] },
    ],
  },
  {
    id: 'stealth-penetration',
    name: 'Stealth Penetration',
    description: 'Stealth aircraft and drones attempt to slip past a radar-heavy defence network.',
    attacks: [
      { type: 'stealth-aircraft', trajectory: 'cruise', position: [-500, 60, -50], velocity: [70, 0, 10] },
      { type: 'stealth-drone', trajectory: 'cruise', position: [-480, 50, 80], velocity: [50, 0, -10] },
      { type: 'stealth-drone', trajectory: 'straight', position: [-460, 55, -120], velocity: [55, 0, 30] },
      { type: 'f-22', trajectory: 'zigzag', position: [-520, 100, 0], velocity: [120, 0, 5] },
    ],
    defences: [
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [80, 0, 0] },
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [20, 0, -60] },
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [20, 0, 60] },
      { type: 'signal-jammer', trajectory: 'direct-intercept', position: [0, 0, 0] },
    ],
  },
  {
    id: 'saturation-attack',
    name: 'Saturation Attack',
    description: '20 rockets and missiles saturate defences — can they handle the volume?',
    attacks: [
      ...Array.from({ length: 10 }, (_, i) => ({
        type: 'rocket' as const,
        trajectory: 'straight' as const,
        position: [-400 + (i % 5) * 15, 30 + i * 3, -200 + i * 40] as [number, number, number],
        velocity: [100, 0, 10 - i * 2] as [number, number, number],
      })),
      ...Array.from({ length: 5 }, (_, i) => ({
        type: 'cruise-missile' as const,
        trajectory: 'cruise' as const,
        position: [-500, 20, -100 + i * 50] as [number, number, number],
        velocity: [80, 0, 5 - i * 2] as [number, number, number],
      })),
      ...Array.from({ length: 5 }, (_, i) => ({
        type: 'kamikaze-drone' as const,
        trajectory: 'dive' as const,
        position: [-350, 80, -100 + i * 50] as [number, number, number],
        velocity: [50, 0, 5] as [number, number, number],
      })),
    ],
    defences: [
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [0, 0, 0] },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [40, 0, -40] },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [40, 0, 40] },
      { type: 'ciws', trajectory: 'burst-fire', position: [0, 0, 30] },
      { type: 'ciws', trajectory: 'burst-fire', position: [0, 0, -30] },
      { type: 'aa-gun', trajectory: 'burst-fire', position: [-20, 0, 0] },
    ],
  },
  {
    id: 'iron-dome-scenario',
    name: 'Iron Dome Scenario',
    description: '15 rockets test a concentrated Iron Dome-style short-range defence grid.',
    attacks: [
      ...Array.from({ length: 15 }, (_, i) => ({
        type: 'rocket' as const,
        trajectory: 'ballistic' as const,
        position: [-350 + (i % 5) * 10, 20 + i * 2, -200 + Math.floor(i / 5) * 100] as [number, number, number],
        velocity: [80, 50, 10 - Math.floor(i / 5) * 10] as [number, number, number],
      })),
    ],
    defences: [
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [0, 0, -50] },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [0, 0, 50] },
      { type: 'short-range-sam', trajectory: 'proportional-nav', position: [30, 0, 0] },
      { type: 'short-range-sam', trajectory: 'proportional-nav', position: [-30, 0, 0] },
    ],
  },
  {
    id: 'multi-domain-assault',
    name: 'Multi-Domain Assault',
    description: 'Fighter jets, drones, cruise missiles, and EW aircraft in a coordinated multi-domain attack.',
    attacks: [
      { type: 'f-35', trajectory: 'zigzag', position: [-500, 120, -100], velocity: [130, 0, 20] },
      { type: 'su-57', trajectory: 'zigzag', position: [-480, 110, 100], velocity: [125, 0, -15] },
      { type: 'cruise-missile', trajectory: 'cruise', position: [-550, 15, -50], velocity: [75, 0, 10] },
      { type: 'cruise-missile', trajectory: 'cruise', position: [-540, 18, 50], velocity: [78, 0, -8] },
      { type: 'swarm-drone', trajectory: 'swarm', position: [-400, 60, -80], velocity: [40, 0, 20] },
      { type: 'swarm-drone', trajectory: 'swarm', position: [-390, 55, 0], velocity: [42, 0, 5] },
      { type: 'swarm-drone', trajectory: 'swarm', position: [-410, 65, 80], velocity: [38, 0, -15] },
      { type: 'ew-aircraft', trajectory: 'loitering', position: [-350, 130, 0], velocity: [20, 0, 5] },
      { type: 'decoy', trajectory: 'straight', position: [-450, 50, -150], velocity: [60, 0, 35] },
      { type: 'decoy', trajectory: 'straight', position: [-450, 50, 150], velocity: [60, 0, -35] },
    ],
    defences: [
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [100, 0, 0] },
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [40, 0, -80] },
      { type: 'medium-range-sam', trajectory: 'proportional-nav', position: [40, 0, 80] },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [0, 0, 0] },
      { type: 'ciws', trajectory: 'burst-fire', position: [-10, 0, 20] },
      { type: 'anti-drone-gun', trajectory: 'burst-fire', position: [20, 0, -20] },
      { type: 'signal-jammer', trajectory: 'direct-intercept', position: [0, 0, 40] },
    ],
  },
  {
    id: 'operation-crossfire',
    name: 'Operation Crossfire',
    description: 'A deliberately balanced multi-axis raid collides with a layered but finite defence. Expect decoys, mass launches, confirmed kills, leakers and near-simultaneous impacts.',
    simulationSeed: 82471,
    attacks: [
      // An electronic-attack orbit and a visible strike fighter pull the outer
      // layer in different directions before the mass raid reaches the grid.
      {
        type: 'ew-aircraft', trajectory: 'loitering', position: [-430, 120, 0], velocity: [70, 0, 8], launchDelay: 0,
        params: { jammingStrength: 0.72, stealthFactor: 0.12 },
      },
      {
        type: 'fighter-jet', trajectory: 'zigzag', position: [-500, 125, -190], velocity: [175, 0, 34], launchDelay: 0.8,
        params: { stealthFactor: 0.18, turnRate: 3.4 },
      },

      // Wave one: obvious radar returns and cheap ballistic threats create
      // the first wall of launches and consume long-range attention.
      ...Array.from({ length: 4 }, (_, i) => ({
        type: 'decoy' as const,
        trajectory: 'straight' as const,
        position: [-440 - i * 9, 48 + i * 5, -180 + i * 120] as [number, number, number],
        velocity: [92, 0, 12 - i * 8] as [number, number, number],
        launchDelay: 0.35 + i * 0.22,
      })),
      ...Array.from({ length: 6 }, (_, i) => ({
        type: 'rocket' as const,
        trajectory: 'ballistic' as const,
        position: [-405 - (i % 3) * 16, 18 + i * 2, -190 + i * 76] as [number, number, number],
        velocity: [72 + (i % 2) * 4, 0, 6 - i * 2] as [number, number, number],
        launchDelay: 1.2 + (i % 3) * 0.18,
      })),

      // Wave two arrives from north and south. The separated geometry makes
      // the camera, trails and layered radar picture much more readable.
      ...Array.from({ length: 5 }, (_, i) => ({
        type: 'swarm-drone' as const,
        trajectory: 'swarm' as const,
        position: [-120 + i * 58, 58 + (i % 2) * 8, -430 - (i % 2) * 12] as [number, number, number],
        velocity: [18 - i * 3, 0, 58] as [number, number, number],
        launchDelay: 3 + i * 0.2,
        params: { stealthFactor: 0.22 },
      })),
      ...Array.from({ length: 4 }, (_, i) => ({
        type: 'cruise-missile' as const,
        trajectory: 'cruise' as const,
        position: [-150 + i * 96, 24 + i * 2, 490 + (i % 2) * 18] as [number, number, number],
        velocity: [8 - i * 5, 0, -112] as [number, number, number],
        launchDelay: 4.1 + i * 0.3,
        params: { stealthFactor: 0.3, speed: 112 },
      })),

      // Strategic tracks force the outer layer to keep firing while three
      // low-observable terminal attackers are positioned to create leakers.
      {
        type: 'ballistic-missile', trajectory: 'ballistic', position: [-430, 28, -245], velocity: [82, 0, 8], launchDelay: 6.2,
        params: { stealthFactor: 0.06 },
      },
      {
        type: 'ballistic-missile', trajectory: 'ballistic', position: [-445, 30, 245], velocity: [84, 0, -8], launchDelay: 6.55,
        params: { stealthFactor: 0.08 },
      },
      ...Array.from({ length: 3 }, (_, i) => ({
        type: 'kamikaze-drone' as const,
        trajectory: 'dive' as const,
        position: [205 + i * 12, 48 + i * 7, -82 + i * 82] as [number, number, number],
        velocity: [-108, 0, 12 - i * 12] as [number, number, number],
        launchDelay: 8.4 + i * 0.3,
        params: {
          speed: 112,
          acceleration: 26,
          stealthFactor: 0.8,
          accuracy: 0.96,
          guidanceSystem: 'gps' as const,
        },
      })),
    ],
    defences: [
      {
        type: 'long-range-sam', trajectory: 'predictive-intercept', position: [96, 0, -52], presetId: 'patriot',
        params: { accuracy: 0.9, cooldown: 2.6, ammo: 10, maxAmmo: 10, reloadTime: 11, maxTrackedTargets: 6 },
      },
      {
        type: 'long-range-sam', trajectory: 'proportional-nav', position: [96, 0, 52], presetId: 'patriot',
        params: { accuracy: 0.88, cooldown: 2.8, ammo: 9, maxAmmo: 9, reloadTime: 11, maxTrackedTargets: 6 },
      },
      {
        type: 'medium-range-sam', trajectory: 'proportional-nav', position: [18, 0, -82], presetId: 'buk',
        params: { accuracy: 0.86, cooldown: 1.9, ammo: 8, maxAmmo: 8, maxTrackedTargets: 5 },
      },
      {
        type: 'medium-range-sam', trajectory: 'radar-guided', position: [18, 0, 82], presetId: 'nasams',
        params: { accuracy: 0.87, cooldown: 1.8, ammo: 8, maxAmmo: 8, maxTrackedTargets: 5 },
      },
      {
        type: 'short-range-sam', trajectory: 'predictive-intercept', position: [-20, 0, -38], presetId: 'iron-dome',
        params: { accuracy: 0.88, cooldown: 0.78, ammo: 16, maxAmmo: 16, reloadTime: 7 },
      },
      {
        type: 'short-range-sam', trajectory: 'predictive-intercept', position: [-20, 0, 38], presetId: 'iron-dome',
        params: { accuracy: 0.88, cooldown: 0.78, ammo: 16, maxAmmo: 16, reloadTime: 7 },
      },
      {
        type: 'ciws', trajectory: 'burst-fire', position: [22, 0, 0], presetId: 'ciws',
        params: { accuracy: 0.7, detectionRange: 75, maxRange: 48, cooldown: 0.28, maxTrackedTargets: 3 },
      },
      {
        type: 'anti-drone-gun', trajectory: 'burst-fire', position: [-48, 0, -5], presetId: 'anti-drone-gun',
        params: { accuracy: 0.72, detectionRange: 92, maxRange: 62, cooldown: 0.24, maxTrackedTargets: 3 },
      },
      {
        type: 'aa-gun', trajectory: 'burst-fire', position: [-30, 0, 42], presetId: 'aa-gun',
        params: { accuracy: 0.66, detectionRange: 82, maxRange: 56, cooldown: 0.2, maxTrackedTargets: 2 },
      },
      { type: 'signal-jammer', trajectory: 'direct-intercept', position: [34, 0, 34], presetId: 'signal-jammer' },
    ],
  },

  // ─── USA ──────────────────────────────────────────────────────────────
  {
    id: 'usa-dc-defence',
    name: 'Washington DC Air Defence',
    description: 'Cruise missiles and stealth drones approach the capital. SAM batteries defend DC.',
    attacks: [
      { type: 'cruise-missile', trajectory: 'cruise', position: [-500, 15, -50], velocity: [80, 0, 10] },
      { type: 'cruise-missile', trajectory: 'cruise', position: [-480, 18, 50], velocity: [75, 0, -5] },
      { type: 'cruise-missile', trajectory: 'cruise', position: [-510, 12, 0], velocity: [82, 0, 0] },
      { type: 'stealth-drone', trajectory: 'cruise', position: [-400, 50, -100], velocity: [50, 0, 20] },
      { type: 'stealth-drone', trajectory: 'straight', position: [-420, 55, 100], velocity: [48, 0, -18] },
    ],
    defences: [
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [0, 0, 0] },
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [-40, 0, -60] },
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [-40, 0, 60] },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [0, 0, 30] },
      { type: 'ciws', trajectory: 'burst-fire', position: [10, 0, -10] },
    ],
  },
  {
    id: 'usa-pearl-harbor',
    name: 'Pearl Harbor Strike',
    description: 'Naval missiles and kamikaze drones strike Pearl Harbor. CIWS and short-range SAMs defend.',
    attacks: [
      { type: 'naval-missile', trajectory: 'cruise', position: [-600, 12, -250], velocity: [70, 0, 15] },
      { type: 'naval-missile', trajectory: 'cruise', position: [-620, 15, -180], velocity: [72, 0, -5] },
      { type: 'kamikaze-drone', trajectory: 'dive', position: [-500, 80, -220], velocity: [45, 0, 8] },
      { type: 'kamikaze-drone', trajectory: 'dive', position: [-520, 75, -180], velocity: [50, 0, -5] },
      { type: 'kamikaze-drone', trajectory: 'dive', position: [-480, 85, -200], velocity: [48, 0, 0] },
    ],
    defences: [
      { type: 'ciws', trajectory: 'burst-fire', position: [-400, 0, -200] },
      { type: 'ciws', trajectory: 'burst-fire', position: [-380, 0, -180] },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [-400, 0, -220] },
      { type: 'short-range-sam', trajectory: 'proportional-nav', position: [-420, 0, -190] },
    ],
  },

  // ─── RUSSIA ───────────────────────────────────────────────────────────
  {
    id: 'russia-moscow-shield',
    name: 'Moscow Shield',
    description: 'Ballistic missiles target Moscow. S-400 ring defends the capital.',
    attacks: [
      { type: 'ballistic-missile', trajectory: 'ballistic', position: [-500, 30, -150], velocity: [160, 120, 40] },
      { type: 'ballistic-missile', trajectory: 'ballistic', position: [-520, 25, 0], velocity: [155, 130, 5] },
      { type: 'ballistic-missile', trajectory: 'ballistic', position: [-480, 35, 150], velocity: [150, 110, -35] },
      { type: 'hypersonic-glide', trajectory: 'ballistic', position: [-550, 80, 0], velocity: [250, 50, 0] },
    ],
    defences: [
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [60, 0, 60] },
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [60, 0, -60] },
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [-60, 0, 0] },
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [0, 0, 0] },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [20, 0, 0] },
    ],
  },

  // ─── CHINA ────────────────────────────────────────────────────────────
  {
    id: 'china-beijing-umbrella',
    name: 'Beijing Air Umbrella',
    description: 'Stealth drones and F-35s probe Beijing layered SAM defence network.',
    attacks: [
      { type: 'f-35', trajectory: 'zigzag', position: [-500, 110, -80], velocity: [130, 0, 15] },
      { type: 'f-35', trajectory: 'zigzag', position: [-480, 100, 80], velocity: [125, 0, -12] },
      { type: 'stealth-drone', trajectory: 'cruise', position: [-450, 50, -30], velocity: [45, 0, 8] },
      { type: 'stealth-drone', trajectory: 'cruise', position: [-460, 55, 30], velocity: [48, 0, -6] },
      { type: 'stealth-drone', trajectory: 'straight', position: [-420, 45, 0], velocity: [50, 0, 0] },
    ],
    defences: [
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [0, 0, 0] },
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [80, 0, 80] },
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [-40, 0, -40] },
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [40, 0, -40] },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [0, 0, 30] },
      { type: 'signal-jammer', trajectory: 'direct-intercept', position: [0, 0, -60] },
    ],
  },

  // ─── INDIA ────────────────────────────────────────────────────────────
  {
    id: 'india-delhi-dome',
    name: 'Delhi Integrated Air Shield',
    description: 'A layered Indian air-defence network combines S-400, Barak-8, Akash-NG, QRSAM and counter-drone systems to protect New Delhi.',
    attacks: [
      ...Array.from({ length: 8 }, (_, i) => ({
        type: 'swarm-drone' as const,
        trajectory: 'swarm' as const,
        position: [-400 + (i % 4) * 20, 55 + i * 3, -150 + Math.floor(i / 4) * 100] as [number, number, number],
        velocity: [40, 0, 15 - i * 3] as [number, number, number],
      })),
      { type: 'rocket', trajectory: 'ballistic', position: [-350, 20, -50] as [number, number, number], velocity: [90, 50, 10] as [number, number, number] },
      { type: 'rocket', trajectory: 'ballistic', position: [-360, 22, 50] as [number, number, number], velocity: [85, 55, -8] as [number, number, number] },
      { type: 'rocket', trajectory: 'ballistic', position: [-340, 18, 0] as [number, number, number], velocity: [92, 48, 0] as [number, number, number] },
    ],
    defences: [
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [85, 0, -48], presetId: 'india-s-400' },
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [85, 0, 48], presetId: 'india-s-400' },
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [25, 0, -72], presetId: 'barak-8' },
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [25, 0, 72], presetId: 'barak-8' },
      { type: 'medium-range-sam', trajectory: 'proportional-nav', position: [-38, 0, -42], presetId: 'akash-ng' },
      { type: 'medium-range-sam', trajectory: 'proportional-nav', position: [-38, 0, 42], presetId: 'akash-ng' },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [-5, 0, -24], presetId: 'qrsam' },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [-5, 0, 24], presetId: 'qrsam' },
      { type: 'anti-drone-gun', trajectory: 'burst-fire', position: [-42, 0, -14], presetId: 'drdo-cuas' },
      { type: 'anti-drone-gun', trajectory: 'burst-fire', position: [-42, 0, 14], presetId: 'drdo-cuas' },
      { type: 'ciws', trajectory: 'burst-fire', position: [12, 0, 0], presetId: 'ak-630-india' },
    ],
  },

  // ─── UK ───────────────────────────────────────────────────────────────
  {
    id: 'uk-london-defence',
    name: 'London Defence',
    description: 'Cruise missiles approach London. Medium-range SAMs and CIWS protect the city.',
    attacks: [
      { type: 'cruise-missile', trajectory: 'cruise', position: [-500, 15, -60], velocity: [78, 0, 12] },
      { type: 'cruise-missile', trajectory: 'cruise', position: [-480, 18, 60], velocity: [80, 0, -10] },
      { type: 'cruise-missile', trajectory: 'cruise', position: [-520, 12, 0], velocity: [76, 0, 0] },
      { type: 'kamikaze-drone', trajectory: 'dive', position: [-380, 80, -30], velocity: [48, 0, 5] },
      { type: 'kamikaze-drone', trajectory: 'dive', position: [-400, 75, 30], velocity: [50, 0, -5] },
    ],
    defences: [
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [30, 0, -40] },
      { type: 'medium-range-sam', trajectory: 'proportional-nav', position: [30, 0, 40] },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [0, 0, 0] },
      { type: 'ciws', trajectory: 'burst-fire', position: [-10, 0, 10] },
      { type: 'ciws', trajectory: 'burst-fire', position: [10, 0, -10] },
    ],
  },

  // ─── FRANCE ───────────────────────────────────────────────────────────
  {
    id: 'france-paris-interception',
    name: 'Paris Interception',
    description: 'Mixed attack on Paris with cruise missiles and drones. Medium SAMs and jammers defend.',
    attacks: [
      { type: 'cruise-missile', trajectory: 'cruise', position: [-500, 15, -40], velocity: [76, 0, 8] },
      { type: 'cruise-missile', trajectory: 'cruise', position: [-490, 18, 40], velocity: [78, 0, -6] },
      { type: 'kamikaze-drone', trajectory: 'dive', position: [-380, 80, -60], velocity: [50, 0, 12] },
      { type: 'kamikaze-drone', trajectory: 'dive', position: [-400, 85, 60], velocity: [48, 0, -10] },
      { type: 'recon-drone', trajectory: 'loitering', position: [-350, 100, 0], velocity: [25, 0, 5] },
    ],
    defences: [
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [20, 0, -30] },
      { type: 'medium-range-sam', trajectory: 'proportional-nav', position: [20, 0, 30] },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [0, 0, 0] },
      { type: 'signal-jammer', trajectory: 'direct-intercept', position: [-20, 0, 0] },
      { type: 'anti-drone-gun', trajectory: 'burst-fire', position: [0, 0, -50] },
    ],
  },

  // ─── ISRAEL ───────────────────────────────────────────────────────────
  {
    id: 'israel-tel-aviv-barrage',
    name: 'Tel Aviv Rocket Barrage',
    description: 'Mass rocket barrage at Tel Aviv. 4 Iron Dome batteries in defence.',
    attacks: [
      ...Array.from({ length: 16 }, (_, i) => ({
        type: 'rocket' as const,
        trajectory: 'ballistic' as const,
        position: [-350 + (i % 4) * 12, 18 + i * 1.5, -120 + Math.floor(i / 4) * 60] as [number, number, number],
        velocity: [85, 50 + i * 2, 8 - Math.floor(i / 4) * 4] as [number, number, number],
      })),
    ],
    defences: [
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [0, 0, -40] },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [0, 0, 40] },
      { type: 'short-range-sam', trajectory: 'proportional-nav', position: [40, 0, 0] },
      { type: 'short-range-sam', trajectory: 'proportional-nav', position: [-40, 0, 0] },
    ],
  },

  // ─── IRAN ─────────────────────────────────────────────────────────────
  {
    id: 'iran-tehran-strike',
    name: 'Tehran Strike Package',
    description: 'F-22 stealth fighters and cruise missiles vs S-300 SAM ring around Tehran.',
    attacks: [
      { type: 'f-22', trajectory: 'zigzag', position: [-500, 120, -80], velocity: [140, 0, 15] },
      { type: 'f-22', trajectory: 'zigzag', position: [-520, 110, 80], velocity: [135, 0, -12] },
      { type: 'cruise-missile', trajectory: 'cruise', position: [-550, 15, -30], velocity: [78, 0, 6] },
      { type: 'cruise-missile', trajectory: 'cruise', position: [-540, 18, 30], velocity: [80, 0, -5] },
      { type: 'anti-radiation-missile', trajectory: 'straight', position: [-480, 40, 0], velocity: [120, 0, 0] },
    ],
    defences: [
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [50, 0, 50] },
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [50, 0, -50] },
      { type: 'long-range-sam', trajectory: 'radar-guided', position: [-50, 0, 0] },
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [0, 0, 0] },
      { type: 'aa-gun', trajectory: 'burst-fire', position: [0, 0, 30] },
    ],
  },

  // ─── JAPAN ────────────────────────────────────────────────────────────
  {
    id: 'japan-tokyo-shield',
    name: 'Tokyo Missile Shield',
    description: 'Hypersonic and ballistic missiles target Tokyo. Patriot-like batteries defend.',
    attacks: [
      { type: 'hypersonic-glide', trajectory: 'ballistic', position: [-550, 90, -60], velocity: [260, 55, 10] },
      { type: 'hypersonic-glide', trajectory: 'ballistic', position: [-530, 85, 60], velocity: [250, 60, -8] },
      { type: 'ballistic-missile', trajectory: 'ballistic', position: [-500, 25, -100], velocity: [150, 120, 25] },
      { type: 'ballistic-missile', trajectory: 'ballistic', position: [-480, 30, 100], velocity: [145, 115, -20] },
    ],
    defences: [
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [0, 0, 0] },
      { type: 'long-range-sam', trajectory: 'proportional-nav', position: [60, 0, -60] },
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [0, 0, 50] },
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [0, 0, -50] },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [20, 0, 0] },
    ],
  },

  // ─── NORTH KOREA ──────────────────────────────────────────────────────
  {
    id: 'nk-pyongyang-defence',
    name: 'Pyongyang Air Defence',
    description: 'Stealth jets and cruise missiles vs older SAM systems defending Pyongyang.',
    attacks: [
      { type: 'f-35', trajectory: 'zigzag', position: [-500, 110, -60], velocity: [130, 0, 10] },
      { type: 'stealth-aircraft', trajectory: 'cruise', position: [-480, 60, 60], velocity: [70, 0, -10] },
      { type: 'cruise-missile', trajectory: 'cruise', position: [-520, 15, 0], velocity: [78, 0, 0] },
      { type: 'cruise-missile', trajectory: 'cruise', position: [-500, 18, -100], velocity: [76, 0, 20] },
      { type: 'decoy', trajectory: 'straight', position: [-450, 45, 100], velocity: [60, 0, -15] },
    ],
    defences: [
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [30, 0, 30] },
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [30, 0, -30] },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [0, 0, 0] },
      { type: 'aa-gun', trajectory: 'burst-fire', position: [-20, 0, 20] },
      { type: 'aa-gun', trajectory: 'burst-fire', position: [-20, 0, -20] },
    ],
  },

  // ─── TURKEY ───────────────────────────────────────────────────────────
  {
    id: 'turkey-istanbul-strait',
    name: 'Istanbul Strait Defence',
    description: 'Naval missiles and kamikaze drones attack Istanbul. Mixed coastal defence responds.',
    attacks: [
      { type: 'naval-missile', trajectory: 'cruise', position: [-500, 12, -40], velocity: [70, 0, 8] },
      { type: 'naval-missile', trajectory: 'cruise', position: [-520, 15, 40], velocity: [72, 0, -6] },
      { type: 'naval-missile', trajectory: 'cruise', position: [-480, 10, 0], velocity: [68, 0, 0] },
      { type: 'kamikaze-drone', trajectory: 'dive', position: [-380, 80, -60], velocity: [50, 0, 12] },
      { type: 'kamikaze-drone', trajectory: 'dive', position: [-400, 75, 60], velocity: [48, 0, -10] },
      { type: 'kamikaze-drone', trajectory: 'dive', position: [-360, 85, 0], velocity: [52, 0, 0] },
    ],
    defences: [
      { type: 'medium-range-sam', trajectory: 'radar-guided', position: [30, 0, -30] },
      { type: 'medium-range-sam', trajectory: 'proportional-nav', position: [30, 0, 30] },
      { type: 'ciws', trajectory: 'burst-fire', position: [0, 0, 0] },
      { type: 'ciws', trajectory: 'burst-fire', position: [-20, 0, 20] },
      { type: 'short-range-sam', trajectory: 'predictive-intercept', position: [10, 0, -10] },
      { type: 'anti-drone-gun', trajectory: 'burst-fire', position: [-10, 0, 10] },
    ],
  },
]
