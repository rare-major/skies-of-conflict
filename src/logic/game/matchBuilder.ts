import type { Vector3Tuple } from 'three'
import { ATTACK_PRESETS } from '../../data/attackPresets'
import { DEFENCE_PRESETS } from '../../data/defencePresets'
import { ATTACK_CATALOG, DEFENCE_CATALOG, INTEL_COSTS } from '../../data/gameModes'
import type { AttackDoctrine, DefenceDoctrine, ForceSelection, MatchResult, MatchRules, ModeOperation } from '../../types/game'
import type { EntityParams } from '../../types/entities'
import type { Scenario, ScenarioAttackEntry, ScenarioDefenceEntry } from '../../types/scenarios'

export function forceCost(force: ForceSelection[], side: 'attack' | 'defence'): number {
  const catalog = side === 'attack' ? ATTACK_CATALOG : DEFENCE_CATALOG
  return force.reduce((total, selection) => {
    const item = catalog.find((candidate) => candidate.id === selection.assetId)
    return total + (item?.cost || 0) * selection.count
  }, 0)
}

export function forceUnits(force: ForceSelection[]): number {
  return force.reduce((total, selection) => total + selection.count, 0)
}

function defencePosition(index: number, total: number, doctrine: DefenceDoctrine): Vector3Tuple {
  const t = total <= 1 ? 0.5 : index / (total - 1)
  if (doctrine.formation === 'ring') {
    const angle = t * Math.PI * 2
    const radius = 78 + (index % 2) * 26
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]
  }
  if (doctrine.formation === 'concentrated') {
    const angle = t * Math.PI * 2
    const radius = 24 + (index % 3) * 12
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]
  }
  const layer = index % 3
  const lane = Math.floor(index / 3)
  return [60 - layer * 62, 0, (lane - Math.floor((total / 3) / 2)) * 48 + (layer - 1) * 12]
}

function attackPosition(index: number, total: number, doctrine: AttackDoctrine): Vector3Tuple {
  const lane = (index - (total - 1) / 2) * 28
  const spread = doctrine.formation === 'saturation' ? lane * 0.45 : lane
  const depth = doctrine.formation === 'multi-axis' ? (index % 3) * 42 : 0
  const altitude = doctrine.altitude === 'nap-of-earth' ? 18 : doctrine.altitude === 'high' ? 135 : 68

  switch (doctrine.approach) {
    case 'east': return [440 + depth, altitude + (index % 3) * 5, spread]
    case 'north': return [spread, altitude + (index % 3) * 5, -440 - depth]
    case 'south': return [spread, altitude + (index % 3) * 5, 440 + depth]
    default: return [-440 - depth, altitude + (index % 3) * 5, spread]
  }
}

function launchDelay(index: number, doctrine: AttackDoctrine): number {
  if (doctrine.waveTiming === 'staggered') return Math.floor(index / 3) * 1.6
  if (doctrine.waveTiming === 'feint-first') return index < 2 ? 0 : 2.8 + Math.floor((index - 2) / 4) * 0.8
  return 0
}

function attackVelocity(type: ScenarioAttackEntry['type'], doctrine: AttackDoctrine): Vector3Tuple {
  const speed = ATTACK_PRESETS.find((candidate) => candidate.type === type)?.params.speed || 60
  switch (doctrine.approach) {
    case 'east': return [-speed, 0, 0]
    case 'north': return [0, 0, speed]
    case 'south': return [0, 0, -speed]
    default: return [speed, 0, 0]
  }
}

function defenceModifiers(doctrine: DefenceDoctrine): Partial<EntityParams> {
  const modifiers: Partial<EntityParams> = {}
  if (doctrine.radarPolicy === 'networked') {
    modifiers.detectionRange = undefined
    modifiers.reactionDelay = 0.55
  } else if (doctrine.radarPolicy === 'silent-watch') {
    modifiers.reactionDelay = 1.8
  }
  if (doctrine.salvoPolicy === 'overwhelming') modifiers.cooldown = 0.65
  if (doctrine.salvoPolicy === 'conserve') modifiers.cooldown = 2.8
  return modifiers
}

function applyDefenceModifiers(presetId: string, doctrine: DefenceDoctrine): Partial<EntityParams> {
  const preset = DEFENCE_PRESETS.find((candidate) => candidate.id === presetId)
  if (!preset) return {}
  const generic = defenceModifiers(doctrine)
  const reserveFactor = Math.max(0.25, 1 - doctrine.reservePercent / 100)
  const result: Partial<EntityParams> = {
    ammo: Math.max(1, Math.floor(preset.params.ammo * reserveFactor)),
    maxAmmo: preset.params.maxAmmo,
    threatPriority: doctrine.engagementPriority,
  }
  if (doctrine.radarPolicy === 'networked') {
    result.detectionRange = preset.params.detectionRange * 1.15
    result.reactionDelay = Math.max(0.1, preset.params.reactionDelay * 0.65)
  } else if (doctrine.radarPolicy === 'silent-watch') {
    result.detectionRange = preset.params.detectionRange * 0.72
    result.reactionDelay = preset.params.reactionDelay + 0.8
  }
  if (generic.cooldown !== undefined) result.cooldown = preset.params.cooldown * generic.cooldown
  return result
}

function applyAttackModifiers(type: ScenarioAttackEntry['type'], doctrine: AttackDoctrine): Partial<EntityParams> {
  const preset = ATTACK_PRESETS.find((candidate) => candidate.type === type)
  if (!preset) return {}
  const result: Partial<EntityParams> = {}
  if (doctrine.altitude === 'nap-of-earth') result.stealthFactor = Math.min(0.92, preset.params.stealthFactor + 0.12)
  if (doctrine.formation === 'low-observable') result.stealthFactor = Math.min(0.95, preset.params.stealthFactor + 0.1)
  if (doctrine.formation === 'saturation') result.speed = preset.params.speed * 1.08
  return result
}

export function buildCommanderScenario(
  operationName: string,
  rules: MatchRules,
  defenceForce: ForceSelection[],
  attackForce: ForceSelection[],
  defenceDoctrine: DefenceDoctrine,
  attackDoctrine: AttackDoctrine,
): Scenario {
  const defenceAssets = defenceForce.flatMap((selection) => Array.from({ length: selection.count }, () => DEFENCE_CATALOG.find((item) => item.id === selection.assetId))).filter(Boolean) as typeof DEFENCE_CATALOG
  const attackAssets = attackForce.flatMap((selection) => Array.from({ length: selection.count }, () => ATTACK_CATALOG.find((item) => item.id === selection.assetId))).filter(Boolean) as typeof ATTACK_CATALOG

  const defences: ScenarioDefenceEntry[] = defenceAssets.map((asset, index) => ({
    type: asset.type,
    trajectory: asset.trajectory,
    presetId: asset.presetId,
    position: defencePosition(index, defenceAssets.length, defenceDoctrine),
    params: applyDefenceModifiers(asset.presetId, defenceDoctrine),
  }))

  const attacks: ScenarioAttackEntry[] = attackAssets.map((asset, index) => ({
    type: asset.type,
    trajectory: asset.trajectory,
    position: attackPosition(index, attackAssets.length, attackDoctrine),
    velocity: attackVelocity(asset.type, attackDoctrine),
    launchDelay: launchDelay(index, attackDoctrine),
    params: applyAttackModifiers(asset.type, attackDoctrine),
  }))

  return {
    id: `commander-${rules.seed}`,
    name: operationName,
    description: `${attackDoctrine.formation} strike package versus a ${defenceDoctrine.formation} integrated air-defence network. Competitive seed ${rules.seed}.`,
    simulationSeed: rules.seed,
    attacks,
    defences,
  }
}

export function buildModeOperationScenario(operation: ModeOperation, seed: number): Scenario {
  const scenario = buildCommanderScenario(
    operation.name,
    {
      countryId: operation.countryId,
      defenderBudget: Math.max(1200, forceCost(operation.defenceForce, 'defence')),
      attackerBudget: Math.max(1200, forceCost(operation.attackForce, 'attack')),
      maxDefenceUnits: 20,
      maxAttackUnits: 30,
      seed,
      objective: 'capital',
    },
    operation.defenceForce,
    operation.attackForce,
    operation.defenceDoctrine,
    operation.attackDoctrine,
  )

  if (operation.mode === 'survival') {
    const waveDelay: Partial<Record<ScenarioAttackEntry['type'], number>> = {
      decoy: 0,
      'swarm-drone': 1.5,
      rocket: 5,
      'ew-aircraft': 6.5,
      'cruise-missile': 8,
      'ballistic-missile': 11,
      'hypersonic-glide': 13,
    }
    scenario.attacks = scenario.attacks.map((attack, index) => ({
      ...attack,
      launchDelay: (waveDelay[attack.type] || 0) + (index % 3) * 0.18,
    }))
  }

  const assistance = operation.difficulty === 'Cadet'
    ? { accuracy: 1, reaction: 0.28, cooldown: 0.48, radius: 26, ammo: 1.8, assuredKill: true }
    : operation.difficulty === 'Veteran'
      ? { accuracy: 0.94, reaction: 0.52, cooldown: 0.68, radius: 19, ammo: 1.4, assuredKill: false }
      : { accuracy: 0.88, reaction: 0.78, cooldown: 0.86, radius: 15, ammo: 1.15, assuredKill: false }

  scenario.defences = scenario.defences.map((defence) => {
    const preset = DEFENCE_PRESETS.find((candidate) => candidate.id === defence.presetId)
    if (!preset || defence.type === 'signal-jammer') return defence
    const ammo = Math.max(1, Math.round(preset.params.ammo * assistance.ammo))
    return {
      ...defence,
      params: {
        ...defence.params,
        accuracy: Math.max(preset.params.accuracy, assistance.accuracy),
        reactionDelay: Math.max(0.08, preset.params.reactionDelay * assistance.reaction),
        cooldown: Math.max(0.16, preset.params.cooldown * assistance.cooldown),
        killRadius: Math.max(preset.params.killRadius, assistance.radius),
        ammo,
        maxAmmo: ammo,
        reloadTime: Math.max(1.5, preset.params.reloadTime * 0.6),
        assuredKill: assistance.assuredKill,
      },
    }
  })

  return {
    ...scenario,
    id: `${operation.id}-${seed}`,
    description: operation.description,
  }
}

export function scoreCommanderMatch(input: {
  intercepted: number
  impacts: number
  escaped: number
  duration: number
  interceptorsFired: number
  defenceForce: ForceSelection[]
  attackForce: ForceSelection[]
  intelLevel: keyof typeof INTEL_COSTS
}): MatchResult {
  const total = input.intercepted + input.impacts + input.escaped
  const defenderSpend = forceCost(input.defenceForce, 'defence')
  const attackerSpend = forceCost(input.attackForce, 'attack') + INTEL_COSTS[input.intelLevel]
  const interceptionRate = total > 0 ? Math.round((input.intercepted / total) * 100) : 0
  const economyBonus = Math.max(0, 240 - input.interceptorsFired * 7)
  const defenderScore = Math.max(0, input.intercepted * 120 + economyBonus - input.impacts * 320 - input.escaped * 90)
  const attackerScore = Math.max(0, input.impacts * 380 + input.escaped * 120 + Math.max(0, total - input.intercepted) * 35)
  const winner = defenderScore === attackerScore ? 'draw' : defenderScore > attackerScore ? 'defence' : 'attack'
  const grade = interceptionRate >= 95 ? 'S' : interceptionRate >= 80 ? 'A' : interceptionRate >= 65 ? 'B' : interceptionRate >= 45 ? 'C' : 'D'

  return { winner, defenderScore, attackerScore, intercepted: input.intercepted, impacts: input.impacts, escaped: input.escaped, interceptionRate, duration: input.duration, interceptorsFired: input.interceptorsFired, defenderSpend, attackerSpend, grade }
}
