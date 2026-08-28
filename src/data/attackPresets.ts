import type { AttackType, EntityParams, AttackTrajectory } from '../types/entities'

export interface AttackPreset {
  label: string
  type: AttackType
  defaultTrajectory: AttackTrajectory
  params: EntityParams
  isDecoy: boolean
}

const base: EntityParams = {
  speed: 50,
  acceleration: 0,
  turnRate: 0.5,
  detectionRange: 0,
  stealthFactor: 0,
  accuracy: 1,
  reactionDelay: 0,
  guidanceSystem: 'unguided',
  maxRange: 5000,
  killRadius: 5,
  cooldown: 0,
  maxTrackedTargets: 0,
  fovAngle: 0,
  jammingStrength: 0,
  ammo: 0,
  maxAmmo: 0,
  reloadTime: 0,
  payloadCapacity: 0,
  payloads: [],
}

export const ATTACK_PRESETS: AttackPreset[] = [
  { label: 'Rocket', type: 'rocket', defaultTrajectory: 'straight', isDecoy: false,
    params: { ...base, speed: 120, acceleration: 20 } },
  { label: 'Ballistic Missile', type: 'ballistic-missile', defaultTrajectory: 'ballistic', isDecoy: false,
    params: { ...base, speed: 200, acceleration: 40, guidanceSystem: 'inertial', stealthFactor: 0.05 } },
  { label: 'Cruise Missile', type: 'cruise-missile', defaultTrajectory: 'cruise', isDecoy: false,
    params: { ...base, speed: 80, acceleration: 10, turnRate: 1.0, guidanceSystem: 'gps', stealthFactor: 0.2 } },
  { label: 'Hypersonic Glide', type: 'hypersonic-glide', defaultTrajectory: 'ballistic', isDecoy: false,
    params: { ...base, speed: 350, acceleration: 0, turnRate: 0.3, guidanceSystem: 'inertial', stealthFactor: 0.1 } },
  { label: 'Anti-Radiation Missile', type: 'anti-radiation-missile', defaultTrajectory: 'straight', isDecoy: false,
    params: { ...base, speed: 150, acceleration: 30, guidanceSystem: 'radar', turnRate: 1.5 } },
  { label: 'Recon Drone', type: 'recon-drone', defaultTrajectory: 'loitering', isDecoy: false,
    params: { ...base, speed: 30, turnRate: 2.0, detectionRange: 200, stealthFactor: 0.3 } },
  { label: 'Kamikaze Drone', type: 'kamikaze-drone', defaultTrajectory: 'dive', isDecoy: false,
    params: { ...base, speed: 60, acceleration: 15, turnRate: 2.5, guidanceSystem: 'gps', stealthFactor: 0.25 } },
  { label: 'Swarm Drone', type: 'swarm-drone', defaultTrajectory: 'swarm', isDecoy: false,
    params: { ...base, speed: 40, turnRate: 3.0, stealthFactor: 0.3 } },
  { label: 'Stealth Drone', type: 'stealth-drone', defaultTrajectory: 'cruise', isDecoy: false,
    params: { ...base, speed: 50, turnRate: 1.5, stealthFactor: 0.7, guidanceSystem: 'gps' } },
  { label: 'Loitering Munition', type: 'loitering-munition', defaultTrajectory: 'loitering', isDecoy: false,
    params: { ...base, speed: 35, turnRate: 2.0, guidanceSystem: 'gps', stealthFactor: 0.2 } },
  { label: 'Fighter Jet', type: 'fighter-jet', defaultTrajectory: 'zigzag', isDecoy: false,
    params: { ...base, speed: 180, acceleration: 50, turnRate: 3.0, stealthFactor: 0.15 } },
  { label: 'Stealth Aircraft', type: 'stealth-aircraft', defaultTrajectory: 'cruise', isDecoy: false,
    params: { ...base, speed: 160, acceleration: 40, turnRate: 2.0, stealthFactor: 0.8 } },
  { label: 'Bomber', type: 'bomber', defaultTrajectory: 'straight', isDecoy: false,
    params: { ...base, speed: 100, turnRate: 0.5, stealthFactor: 0.05, killRadius: 30 } },
  { label: 'EW Aircraft', type: 'ew-aircraft', defaultTrajectory: 'loitering', isDecoy: false,
    params: { ...base, speed: 80, turnRate: 1.0, jammingStrength: 0.6, stealthFactor: 0.1 } },
  { label: 'Glide Bomb', type: 'glide-bomb', defaultTrajectory: 'dive', isDecoy: false,
    params: { ...base, speed: 90, guidanceSystem: 'gps', killRadius: 20 } },
  { label: 'Laser-Guided Bomb', type: 'laser-guided-bomb', defaultTrajectory: 'dive', isDecoy: false,
    params: { ...base, speed: 85, guidanceSystem: 'laser', accuracy: 0.95, killRadius: 15 } },
  { label: 'GPS-Guided Bomb', type: 'gps-guided-bomb', defaultTrajectory: 'dive', isDecoy: false,
    params: { ...base, speed: 80, guidanceSystem: 'gps', accuracy: 0.9, killRadius: 15 } },
  { label: 'Cluster Munition', type: 'cluster-munition', defaultTrajectory: 'ballistic', isDecoy: false,
    params: { ...base, speed: 70, killRadius: 50, guidanceSystem: 'unguided' } },
  { label: 'Decoy', type: 'decoy', defaultTrajectory: 'straight', isDecoy: true,
    params: { ...base, speed: 60, stealthFactor: -0.3 } },
  { label: 'Naval Missile', type: 'naval-missile', defaultTrajectory: 'cruise', isDecoy: false,
    params: { ...base, speed: 120, acceleration: 25, turnRate: 1.0, guidanceSystem: 'radar' } },

  // Advanced fighter jets with payloads
  { label: 'F-35 Lightning II', type: 'f-35', defaultTrajectory: 'zigzag', isDecoy: false,
    params: { ...base, speed: 170, acceleration: 45, turnRate: 2.5, stealthFactor: 0.75, detectionRange: 250,
      payloadCapacity: 6, payloads: [
        { type: 'aa-missile', count: 4, speed: 250, killRadius: 12, trajectory: 'straight' },
        { type: 'bomb', count: 2, speed: 80, killRadius: 20, trajectory: 'dive' },
      ] } },
  { label: 'F-22 Raptor', type: 'f-22', defaultTrajectory: 'zigzag', isDecoy: false,
    params: { ...base, speed: 190, acceleration: 55, turnRate: 3.0, stealthFactor: 0.85, detectionRange: 280,
      payloadCapacity: 8, payloads: [
        { type: 'aa-missile', count: 6, speed: 260, killRadius: 12, trajectory: 'straight' },
        { type: 'ag-missile', count: 2, speed: 150, killRadius: 15, trajectory: 'dive' },
      ] } },
  { label: 'Su-30 Flanker', type: 'su-30', defaultTrajectory: 'zigzag', isDecoy: false,
    params: { ...base, speed: 180, acceleration: 50, turnRate: 3.2, stealthFactor: 0.15, detectionRange: 220,
      payloadCapacity: 12, payloads: [
        { type: 'aa-missile', count: 8, speed: 240, killRadius: 10, trajectory: 'straight' },
        { type: 'ag-missile', count: 4, speed: 140, killRadius: 18, trajectory: 'dive' },
      ] } },
  { label: 'Su-57 Felon', type: 'su-57', defaultTrajectory: 'zigzag', isDecoy: false,
    params: { ...base, speed: 185, acceleration: 52, turnRate: 2.8, stealthFactor: 0.70, detectionRange: 260,
      payloadCapacity: 10, payloads: [
        { type: 'aa-missile', count: 6, speed: 250, killRadius: 12, trajectory: 'straight' },
        { type: 'bomb', count: 4, speed: 85, killRadius: 22, trajectory: 'dive' },
      ] } },
  { label: 'Rafale', type: 'rafale', defaultTrajectory: 'zigzag', isDecoy: false,
    params: { ...base, speed: 175, acceleration: 48, turnRate: 3.0, stealthFactor: 0.20, detectionRange: 230,
      payloadCapacity: 10, payloads: [
        { type: 'aa-missile', count: 6, speed: 245, killRadius: 11, trajectory: 'straight' },
        { type: 'ag-missile', count: 4, speed: 145, killRadius: 16, trajectory: 'dive' },
      ] } },
  { label: 'J-35', type: 'j-35', defaultTrajectory: 'zigzag', isDecoy: false,
    params: { ...base, speed: 165, acceleration: 42, turnRate: 2.6, stealthFactor: 0.65, detectionRange: 240,
      payloadCapacity: 6, payloads: [
        { type: 'aa-missile', count: 4, speed: 240, killRadius: 11, trajectory: 'straight' },
        { type: 'ag-missile', count: 2, speed: 135, killRadius: 14, trajectory: 'dive' },
      ] } },
]
