export const ATTACK_TYPE_TIPS: Record<string, string> = {
  'rocket': 'Unguided rocket. Fast, cheap, but no course correction after launch.',
  'ballistic-missile': 'Long-range weapon following a parabolic arc. High speed but predictable trajectory.',
  'cruise-missile': 'Low-altitude guided missile with terrain-hugging flight. Hard to detect on radar.',
  'hypersonic-glide': 'Hypersonic glide vehicle. Extreme speed (Mach 5+) with limited maneuverability.',
  'anti-radiation-missile': 'Homes in on radar emissions. Forces defences to shut down their radars.',
  'recon-drone': 'Surveillance drone. Slow, stealthy, loiters over target area gathering intel.',
  'kamikaze-drone': 'One-way attack drone that dives into its target. GPS-guided with moderate stealth.',
  'swarm-drone': 'Autonomous swarm member. Coordinates with nearby drones using flocking behavior.',
  'stealth-drone': 'Low-observable drone with high stealth factor. Very difficult to detect.',
  'loitering-munition': 'Circles overhead waiting for a target, then dives to attack. "Suicide drone".',
  'fighter-jet': 'Multi-role combat aircraft. Fast, agile, carries missiles and bombs.',
  'stealth-aircraft': 'Low-observable attack aircraft. Very high stealth factor reduces detection range.',
  'bomber': 'Heavy bomber. Slow but carries large payload with wide kill radius.',
  'ew-aircraft': 'Electronic warfare aircraft. Jams enemy radars and disrupts communications.',
  'glide-bomb': 'GPS-guided bomb that glides to target after release. No engine, gravity-driven.',
  'laser-guided-bomb': 'Precision bomb guided by laser designator. Very high accuracy.',
  'gps-guided-bomb': 'Satellite-guided bomb. Good accuracy, works in all weather.',
  'cluster-munition': 'Splits into submunitions over target. Large area effect, unguided.',
  'decoy': 'Mimics radar signature of real weapons. Wastes enemy interceptors.',
  'naval-missile': 'Ship-launched cruise missile. Radar-guided with sea-skimming approach.',
  'f-35': 'F-35 Lightning II. 5th-gen stealth fighter. Carries 4 AA missiles + 2 bombs.',
  'f-22': 'F-22 Raptor. Air superiority stealth fighter. 6 AA missiles + 2 AG missiles.',
  'su-30': 'Su-30 Flanker. Heavy twin-engine fighter. High payload: 8 AA + 4 AG missiles.',
  'su-57': 'Su-57 Felon. Russian 5th-gen stealth fighter. 6 AA missiles + 4 bombs.',
  'rafale': 'Dassault Rafale. French multi-role fighter. 6 AA + 4 AG missiles.',
  'j-35': 'J-35 stealth carrier fighter. 4 AA missiles + 2 AG missiles.',
}

export const DEFENCE_TYPE_TIPS: Record<string, string> = {
  'long-range-sam': 'S-400/Patriot-class. Engages targets at 400-500km. 360° radar coverage.',
  'medium-range-sam': 'NASAMS/Buk-class. 200-300km range. Good balance of speed and accuracy.',
  'short-range-sam': 'Iron Dome-class. High fire rate, 90% accuracy. Optimized for rockets and drones.',
  'ciws': 'Close-In Weapon System. Rapid-fire gun for last-resort point defence. 30km range.',
  'aa-gun': 'Anti-aircraft gun. 360° coverage, high fire rate, moderate accuracy.',
  'anti-drone-gun': 'Specialized anti-drone system. Narrow FOV but includes signal jamming.',
  'signal-jammer': 'Electronic warfare. Degrades enemy radar and GPS guidance within range.',
  'laser-defence': 'Directed energy weapon. Precise, unlimited "ammo" but limited by cooldown.',
}

export const ATTACK_TRAJECTORY_TIPS: Record<string, string> = {
  'straight': 'Direct line to target. Fastest but easiest to intercept.',
  'ballistic': 'Parabolic arc with gravity. High altitude then steep descent.',
  'cruise': 'Low-altitude terrain-following path. Harder to detect on radar.',
  'zigzag': 'Evasive zig-zag pattern. Harder to predict, trades speed for survivability.',
  'waypoint': 'Follows predefined waypoints using Catmull-Rom spline interpolation.',
  'dive': 'Cruises at altitude then dives steeply toward target for terminal attack.',
  'loitering': 'Circles over an area waiting for targets. Used by recon and loitering munitions.',
  'swarm': 'Boids-based flocking. Drones coordinate movement toward a shared goal.',
}

export const DEFENCE_TRAJECTORY_TIPS: Record<string, string> = {
  'direct-intercept': 'Flies straight at the target. Simple but ineffective against maneuvering targets.',
  'predictive-intercept': 'Leads the target based on current velocity. Good against straight-line threats.',
  'proportional-nav': 'Steers proportionally to line-of-sight rotation. Optimal for maneuvering targets.',
  'radar-guided': 'Uses discrete radar updates with cached target data. Realistic engagement.',
  'heat-seeking': 'Follows target heat signature. Direct pursuit with high turn rate.',
  'burst-fire': 'Rapid burst of projectiles. Used by CIWS and AA guns for area saturation.',
}

export const CAMERA_TIPS: Record<string, string> = {
  'free': 'Manual orbit camera. Drag to rotate, scroll to zoom.',
  'combat': 'Auto-frames the combat zone between attacks and defences.',
  'follow': 'Tracks the selected entity. Select one from the Entities tab.',
  'cinematic': 'Slow cinematic orbit around the action center.',
}

export const TOGGLE_TIPS: Record<string, string> = {
  'Trails': 'Show trajectory trails behind moving entities.',
  'Radar': 'Visualize radar detection cones and coverage areas.',
  'Collisions': 'Show collision detection spheres around entities.',
  'Terrain': 'Toggle 3D procedural terrain with elevation.',
  'Dome Grid': 'Hemisphere wireframe grid for altitude and bearing reference.',
}

export const BUTTON_TIPS: Record<string, string> = {
  'Start': 'Begin the simulation. Entities will move along their trajectories.',
  'Pause': 'Pause the simulation. All entities freeze in place.',
  'Reset': 'Restore the scenario to its initial state. Keeps the loaded scenario.',
  'Clear': 'Remove all entities and clear the scene completely.',
  'Record': 'Start recording entity positions for replay.',
  'Replay': 'Play back the recorded simulation.',
}

export const PARAM_TIPS: Record<string, string> = {
  'Speed': 'Base movement speed in units per second.',
  'Acceleration': 'Rate of speed increase over time.',
  'Turn Rate': 'How quickly the entity can change direction (radians/sec).',
  'Accuracy': 'Hit probability (0-1). Higher means more likely to intercept.',
  'Kill Radius': 'Blast/proximity radius for successful interception.',
  'Reaction Delay': 'Time before the defence system reacts to a new threat.',
  'Det. Range': 'Maximum detection range for radar/sensors.',
  'Stealth': 'Radar cross-section factor. Higher = harder to detect. Negative = more visible.',
}

export const TIMESCALE_TIPS: Record<string, string> = {
  '0.5x': 'Half speed. Good for observing interception details.',
  '1x': 'Real-time simulation speed.',
  '2x': 'Double speed. Faster results.',
  '5x': 'Fast forward. Quickly see scenario outcomes.',
  '10x': 'Maximum speed. Skip to the end.',
}
