import type { DefenceType, EntityParams, DefenceTrajectory } from '../types/entities'

export interface DefencePreset {
  id: string
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
  { id: 's-400', label: 'S-400 (Long Range)', type: 'long-range-sam', defaultTrajectory: 'proportional-nav', isInterceptor: true,
    params: { ...base, detectionRange: 600, maxRange: 500, accuracy: 0.85, reactionDelay: 2.0, cooldown: 5.0, maxTrackedTargets: 6, fovAngle: 360, killRadius: 15, ammo: 4, maxAmmo: 4, reloadTime: 12 } },
  { id: 'india-s-400', label: 'S-400 Triumf — India', type: 'long-range-sam', defaultTrajectory: 'proportional-nav', isInterceptor: true,
    params: { ...base, detectionRange: 720, maxRange: 620, accuracy: 1, reactionDelay: 0.2, cooldown: 0.65, maxTrackedTargets: 16, fovAngle: 360, killRadius: 30, ammo: 24, maxAmmo: 24, reloadTime: 3, assuredDetection: true, assuredKill: true } },
  { id: 'patriot', label: 'Patriot (Long Range)', type: 'long-range-sam', defaultTrajectory: 'predictive-intercept', isInterceptor: true,
    params: { ...base, detectionRange: 500, maxRange: 400, accuracy: 0.82, reactionDelay: 1.8, cooldown: 4.0, maxTrackedTargets: 8, fovAngle: 360, killRadius: 12, ammo: 8, maxAmmo: 8, reloadTime: 10 } },
  { id: 'nasams', label: 'NASAMS (Medium Range)', type: 'medium-range-sam', defaultTrajectory: 'radar-guided', isInterceptor: true,
    params: { ...base, detectionRange: 300, maxRange: 200, accuracy: 0.8, reactionDelay: 1.2, cooldown: 2.5, maxTrackedTargets: 4, fovAngle: 180, ammo: 6, maxAmmo: 6, reloadTime: 8 } },
  { id: 'buk', label: 'Buk (Medium Range)', type: 'medium-range-sam', defaultTrajectory: 'proportional-nav', isInterceptor: true,
    params: { ...base, detectionRange: 350, maxRange: 250, accuracy: 0.78, reactionDelay: 1.5, cooldown: 3.0, maxTrackedTargets: 6, fovAngle: 240, ammo: 4, maxAmmo: 4, reloadTime: 10 } },
  { id: 'barak-8', label: 'Barak-8 MR-SAM', type: 'medium-range-sam', defaultTrajectory: 'radar-guided', isInterceptor: true,
    params: { ...base, detectionRange: 520, maxRange: 390, accuracy: 1, reactionDelay: 0.25, cooldown: 0.7, maxTrackedTargets: 16, fovAngle: 360, killRadius: 26, ammo: 20, maxAmmo: 20, reloadTime: 3.5, assuredDetection: true, assuredKill: true } },
  { id: 'akash-ng', label: 'Akash-NG', type: 'medium-range-sam', defaultTrajectory: 'proportional-nav', isInterceptor: true,
    params: { ...base, detectionRange: 450, maxRange: 330, accuracy: 1, reactionDelay: 0.3, cooldown: 0.75, maxTrackedTargets: 14, fovAngle: 360, killRadius: 24, ammo: 18, maxAmmo: 18, reloadTime: 3.5, assuredDetection: true, assuredKill: true } },
  { id: 'iron-dome', label: 'Iron Dome (Short Range)', type: 'short-range-sam', defaultTrajectory: 'predictive-intercept', isInterceptor: true,
    params: { ...base, detectionRange: 150, maxRange: 100, accuracy: 0.9, reactionDelay: 0.5, cooldown: 1.0, maxTrackedTargets: 10, fovAngle: 360, killRadius: 8, ammo: 20, maxAmmo: 20, reloadTime: 5 } },
  { id: 'qrsam', label: 'QRSAM', type: 'short-range-sam', defaultTrajectory: 'predictive-intercept', isInterceptor: true,
    params: { ...base, detectionRange: 300, maxRange: 220, accuracy: 1, reactionDelay: 0.15, cooldown: 0.55, maxTrackedTargets: 12, fovAngle: 360, killRadius: 22, ammo: 24, maxAmmo: 24, reloadTime: 3, assuredDetection: true, assuredKill: true } },
  { id: 'ciws', label: 'CIWS', type: 'ciws', defaultTrajectory: 'burst-fire', isInterceptor: false,
    params: { ...base, detectionRange: 50, maxRange: 30, accuracy: 0.6, reactionDelay: 0.2, cooldown: 0.3, maxTrackedTargets: 1, fovAngle: 120, killRadius: 3, ammo: 100, maxAmmo: 100, reloadTime: 3 } },
  { id: 'aa-gun', label: 'Anti-Aircraft Gun', type: 'aa-gun', defaultTrajectory: 'burst-fire', isInterceptor: false,
    params: { ...base, detectionRange: 80, maxRange: 50, accuracy: 0.5, reactionDelay: 0.3, cooldown: 0.5, maxTrackedTargets: 1, fovAngle: 360, killRadius: 4, ammo: 60, maxAmmo: 60, reloadTime: 4 } },
  { id: 'anti-drone-gun', label: 'Anti-Drone Gun', type: 'anti-drone-gun', defaultTrajectory: 'direct-intercept', isInterceptor: false,
    params: { ...base, detectionRange: 60, maxRange: 40, accuracy: 0.7, reactionDelay: 0.4, cooldown: 0.8, maxTrackedTargets: 2, fovAngle: 90, killRadius: 5, jammingStrength: 0.3, ammo: 30, maxAmmo: 30, reloadTime: 5 } },
  { id: 'drdo-cuas', label: 'DRDO Counter-Drone System', type: 'anti-drone-gun', defaultTrajectory: 'burst-fire', isInterceptor: false,
    params: { ...base, detectionRange: 180, maxRange: 135, accuracy: 1, reactionDelay: 0.1, cooldown: 0.3, maxTrackedTargets: 8, fovAngle: 360, killRadius: 18, jammingStrength: 0.6, ammo: 100, maxAmmo: 100, reloadTime: 2.5, assuredDetection: true, assuredKill: true } },
  { id: 'ak-630-india', label: 'AK-630 Close-In Shield', type: 'ciws', defaultTrajectory: 'burst-fire', isInterceptor: false,
    params: { ...base, detectionRange: 220, maxRange: 180, accuracy: 1, reactionDelay: 0.08, cooldown: 0.2, maxTrackedTargets: 8, fovAngle: 360, killRadius: 18, ammo: 160, maxAmmo: 160, reloadTime: 2, assuredDetection: true, assuredKill: true, sealedZoneRadius: 185 } },
  { id: 'signal-jammer', label: 'Signal Jammer', type: 'signal-jammer', defaultTrajectory: 'direct-intercept', isInterceptor: false,
    params: { ...base, detectionRange: 200, maxRange: 150, accuracy: 0, reactionDelay: 0.1, cooldown: 0, maxTrackedTargets: 0, fovAngle: 360, killRadius: 0, jammingStrength: 0.7, ammo: 999, maxAmmo: 999, reloadTime: 0 } },
  { id: 'laser-defence', label: 'Laser Defence', type: 'laser-defence', defaultTrajectory: 'direct-intercept', isInterceptor: false,
    params: { ...base, detectionRange: 100, maxRange: 60, accuracy: 0.85, reactionDelay: 0.3, cooldown: 1.5, maxTrackedTargets: 1, fovAngle: 180, killRadius: 2, ammo: 50, maxAmmo: 50, reloadTime: 6 } },
]
