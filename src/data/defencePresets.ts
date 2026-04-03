import type { DefenceType, EntityParams, DefenceTrajectory } from '../types/entities'

interface DefencePreset {
  label: string
  type: DefenceType
  defaultTrajectory: DefenceTrajectory
  params: EntityParams
  isInterceptor: boolean
}

const base: EntityParams = {
  speed: 0,
  acceleration: 0,
  turnRate: 0,
  detectionRange: 300,
  stealthFactor: 0,
  accuracy: 0.8,
  reactionDelay: 1.0,
  guidanceSystem: 'radar',
  maxRange: 300,
  killRadius: 10,
  cooldown: 3.0,
  maxTrackedTargets: 4,
  fovAngle: 120,
  jammingStrength: 0,
  ammo: 8,
  maxAmmo: 8,
  reloadTime: 10,
  payloadCapacity: 0,
  payloads: [],
}

export const DEFENCE_PRESETS: DefencePreset[] = [
  { label: 'S-400 (Long Range)', type: 'long-range-sam', defaultTrajectory: 'proportional-nav', isInterceptor: true,
    params: { ...base, detectionRange: 600, maxRange: 500, accuracy: 0.85, reactionDelay: 2.0, cooldown: 5.0, maxTrackedTargets: 6, fovAngle: 360, killRadius: 15, ammo: 4, maxAmmo: 4, reloadTime: 12 } },
  { label: 'Patriot (Long Range)', type: 'long-range-sam', defaultTrajectory: 'predictive-intercept', isInterceptor: true,
    params: { ...base, detectionRange: 500, maxRange: 400, accuracy: 0.82, reactionDelay: 1.8, cooldown: 4.0, maxTrackedTargets: 8, fovAngle: 360, killRadius: 12, ammo: 8, maxAmmo: 8, reloadTime: 10 } },
  { label: 'NASAMS (Medium Range)', type: 'medium-range-sam', defaultTrajectory: 'radar-guided', isInterceptor: true,
    params: { ...base, detectionRange: 300, maxRange: 200, accuracy: 0.8, reactionDelay: 1.2, cooldown: 2.5, maxTrackedTargets: 4, fovAngle: 180, ammo: 6, maxAmmo: 6, reloadTime: 8 } },
  { label: 'Buk (Medium Range)', type: 'medium-range-sam', defaultTrajectory: 'proportional-nav', isInterceptor: true,
    params: { ...base, detectionRange: 350, maxRange: 250, accuracy: 0.78, reactionDelay: 1.5, cooldown: 3.0, maxTrackedTargets: 6, fovAngle: 240, ammo: 4, maxAmmo: 4, reloadTime: 10 } },
  { label: 'Iron Dome (Short Range)', type: 'short-range-sam', defaultTrajectory: 'predictive-intercept', isInterceptor: true,
    params: { ...base, detectionRange: 150, maxRange: 100, accuracy: 0.9, reactionDelay: 0.5, cooldown: 1.0, maxTrackedTargets: 10, fovAngle: 360, killRadius: 8, ammo: 20, maxAmmo: 20, reloadTime: 5 } },
  { label: 'CIWS', type: 'ciws', defaultTrajectory: 'burst-fire', isInterceptor: false,
    params: { ...base, detectionRange: 50, maxRange: 30, accuracy: 0.6, reactionDelay: 0.2, cooldown: 0.3, maxTrackedTargets: 1, fovAngle: 120, killRadius: 3, ammo: 100, maxAmmo: 100, reloadTime: 3 } },
  { label: 'Anti-Aircraft Gun', type: 'aa-gun', defaultTrajectory: 'burst-fire', isInterceptor: false,
    params: { ...base, detectionRange: 80, maxRange: 50, accuracy: 0.5, reactionDelay: 0.3, cooldown: 0.5, maxTrackedTargets: 1, fovAngle: 360, killRadius: 4, ammo: 60, maxAmmo: 60, reloadTime: 4 } },
  { label: 'Anti-Drone Gun', type: 'anti-drone-gun', defaultTrajectory: 'direct-intercept', isInterceptor: false,
    params: { ...base, detectionRange: 60, maxRange: 40, accuracy: 0.7, reactionDelay: 0.4, cooldown: 0.8, maxTrackedTargets: 2, fovAngle: 90, killRadius: 5, jammingStrength: 0.3, ammo: 30, maxAmmo: 30, reloadTime: 5 } },
  { label: 'Signal Jammer', type: 'signal-jammer', defaultTrajectory: 'direct-intercept', isInterceptor: false,
    params: { ...base, detectionRange: 200, maxRange: 150, accuracy: 0, reactionDelay: 0.1, cooldown: 0, maxTrackedTargets: 0, fovAngle: 360, killRadius: 0, jammingStrength: 0.7, ammo: 999, maxAmmo: 999, reloadTime: 0 } },
  { label: 'Laser Defence', type: 'laser-defence', defaultTrajectory: 'direct-intercept', isInterceptor: false,
    params: { ...base, detectionRange: 100, maxRange: 60, accuracy: 0.85, reactionDelay: 0.3, cooldown: 1.5, maxTrackedTargets: 1, fovAngle: 180, killRadius: 2, ammo: 50, maxAmmo: 50, reloadTime: 6 } },
]
