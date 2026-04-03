import { Html } from '@react-three/drei'
import type { LandmarkDef } from '../../data/countries'
import { useThemeStore } from '../../store/themeStore'

interface Props {
  landmark: LandmarkDef
}

export function Landmark({ landmark }: Props) {
  const s = landmark.scale
  const { shape, color, accent, position, name } = landmark
  const theme = useThemeStore((s) => s.theme)
  const dark = theme === 'dark'

  const mat = { color, emissive: color, emissiveIntensity: dark ? 0.2 : 0.05, roughness: 0.5, metalness: 0.15 }

  return (
    <group position={position}>
      {shape === 'dome' && <Dome s={s} mat={mat} accent={accent} />}
      {shape === 'onion-dome' && <OnionDome s={s} mat={mat} accent={accent} />}
      {shape === 'tower' && <Tower s={s} mat={mat} />}
      {shape === 'clock-tower' && <ClockTower s={s} mat={mat} accent={accent} />}
      {shape === 'pyramid' && <Pyramid s={s} mat={mat} />}
      {shape === 'pagoda' && <Pagoda s={s} mat={mat} accent={accent} />}
      {shape === 'wall' && <Wall s={s} mat={mat} />}
      {shape === 'arch' && <Arch s={s} mat={mat} />}
      {shape === 'gate' && <Gate s={s} mat={mat} />}
      {shape === 'torii' && <Torii s={s} mat={mat} />}
      {shape === 'bridge' && <Bridge s={s} mat={mat} accent={accent} />}
      {shape === 'obelisk' && <Obelisk s={s} mat={mat} />}
      {shape === 'eiffel' && <Eiffel s={s} mat={mat} />}
      {shape === 'skyscraper-cluster' && <SkyscraperCluster s={s} mat={mat} accent={accent} />}
      {shape === 'minaret' && <Minaret s={s} mat={mat} />}
      {shape === 'statue-base' && <StatueBase s={s} mat={mat} />}
      {shape === 'fortress' && <Fortress s={s} mat={mat} />}

      <Html
        position={[0, getHeight(shape, s) + 5, 0]}
        center
        distanceFactor={300}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
          fontSize: 8,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          fontFamily: '-apple-system, system-ui, sans-serif',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          {name}
        </div>
      </Html>
    </group>
  )
}

function getHeight(shape: string, s: number): number {
  const heights: Record<string, number> = {
    'dome': 10, 'onion-dome': 18, 'tower': 28, 'clock-tower': 32,
    'pyramid': 22, 'pagoda': 28, 'wall': 6, 'arch': 16,
    'gate': 16, 'torii': 16, 'bridge': 20, 'obelisk': 35,
    'eiffel': 40, 'skyscraper-cluster': 25, 'minaret': 30,
    'statue-base': 14, 'fortress': 10,
  }
  return (heights[shape] || 15) * s
}

type Mat = { color: string; emissive: string; emissiveIntensity: number; roughness: number; metalness: number }

function Dome({ s, mat, accent }: { s: number; mat: Mat; accent?: string }) {
  return (
    <group>
      {/* Base platform with steps */}
      <mesh position={[0, 0.5 * s, 0]}>
        <cylinderGeometry args={[10 * s, 11 * s, 1 * s, 24]} />
        <meshStandardMaterial color={mat.color} roughness={0.7} />
      </mesh>
      {/* Colonnade base */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 7.5 * s, 4 * s, Math.sin(a) * 7.5 * s]}>
            <cylinderGeometry args={[0.4 * s, 0.5 * s, 6 * s, 8]} />
            <meshStandardMaterial color={mat.color} roughness={0.5} />
          </mesh>
        )
      })}
      {/* Drum */}
      <mesh position={[0, 5 * s, 0]}>
        <cylinderGeometry args={[7 * s, 8 * s, 4 * s, 24]} />
        <meshStandardMaterial {...mat} roughness={0.5} />
      </mesh>
      {/* Dome */}
      <mesh position={[0, 7 * s, 0]}>
        <sphereGeometry args={[6.5 * s, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...mat} roughness={0.35} metalness={0.2} />
      </mesh>
      {/* Finial */}
      {accent && (
        <mesh position={[0, 13.5 * s, 0]}>
          <sphereGeometry args={[0.8 * s, 12, 12]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} roughness={0.2} metalness={0.6} />
        </mesh>
      )}
    </group>
  )
}

function OnionDome({ s, mat, accent }: { s: number; mat: Mat; accent?: string }) {
  return (
    <group>
      {/* Base tower */}
      <mesh position={[0, 5 * s, 0]}>
        <cylinderGeometry args={[4 * s, 5 * s, 10 * s, 12]} />
        <meshStandardMaterial {...mat} roughness={0.6} />
      </mesh>
      {/* Onion bulb — stretched sphere narrowed at top */}
      <mesh position={[0, 12 * s, 0]} scale={[1, 1.5, 1]}>
        <sphereGeometry args={[4.5 * s, 16, 16]} />
        <meshStandardMaterial {...mat} roughness={0.3} metalness={0.25} />
      </mesh>
      {/* Spire */}
      <mesh position={[0, 18 * s, 0]}>
        <coneGeometry args={[0.5 * s, 3 * s, 8]} />
        <meshStandardMaterial color={accent || mat.color} emissive={accent || mat.color} emissiveIntensity={0.5} roughness={0.2} metalness={0.5} />
      </mesh>
      {/* Cross/finial */}
      <mesh position={[0, 19.8 * s, 0]}>
        <sphereGeometry args={[0.4 * s, 8, 8]} />
        <meshStandardMaterial color={accent || '#daa520'} emissive={accent || '#daa520'} emissiveIntensity={0.5} metalness={0.7} roughness={0.1} />
      </mesh>
    </group>
  )
}

function Tower({ s, mat }: { s: number; mat: Mat }) {
  return (
    <group>
      <mesh position={[0, 10 * s, 0]}>
        <cylinderGeometry args={[2 * s, 2.8 * s, 20 * s, 8]} />
        <meshStandardMaterial {...mat} roughness={0.5} />
      </mesh>
      {/* Observation deck */}
      <mesh position={[0, 20.5 * s, 0]}>
        <cylinderGeometry args={[3.5 * s, 2 * s, 1 * s, 12]} />
        <meshStandardMaterial {...mat} roughness={0.4} />
      </mesh>
      {/* Upper shaft */}
      <mesh position={[0, 24 * s, 0]}>
        <cylinderGeometry args={[1 * s, 1.5 * s, 6 * s, 8]} />
        <meshStandardMaterial {...mat} roughness={0.4} />
      </mesh>
      {/* Spire */}
      <mesh position={[0, 28 * s, 0]}>
        <coneGeometry args={[0.8 * s, 4 * s, 6]} />
        <meshStandardMaterial {...mat} emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

function ClockTower({ s, mat, accent }: { s: number; mat: Mat; accent?: string }) {
  return (
    <group>
      {/* Main shaft */}
      <mesh position={[0, 12 * s, 0]}>
        <boxGeometry args={[4 * s, 24 * s, 4 * s]} />
        <meshStandardMaterial {...mat} roughness={0.6} />
      </mesh>
      {/* Clock face — 4 sides */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rot, i) => (
        <mesh key={i} position={[Math.sin(rot) * 2.1 * s, 22 * s, Math.cos(rot) * 2.1 * s]} rotation={[0, rot, 0]}>
          <circleGeometry args={[1.5 * s, 16]} />
          <meshStandardMaterial
            color={accent || '#daa520'}
            emissive={accent || '#daa520'}
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>
      ))}
      {/* Belfry with columns */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4
        return (
          <mesh key={i} position={[Math.cos(a) * 2.3 * s, 27 * s, Math.sin(a) * 2.3 * s]}>
            <cylinderGeometry args={[0.25 * s, 0.3 * s, 4 * s, 6]} />
            <meshStandardMaterial {...mat} roughness={0.5} />
          </mesh>
        )
      })}
      {/* Spire */}
      <mesh position={[0, 30 * s, 0]}>
        <coneGeometry args={[2.5 * s, 5 * s, 4]} />
        <meshStandardMaterial {...mat} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Pyramid({ s, mat }: { s: number; mat: Mat }) {
  return (
    <group>
      <mesh position={[0, 10 * s, 0]}>
        <coneGeometry args={[9 * s, 20 * s, 4]} />
        <meshStandardMaterial {...mat} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Edge glow */}
      <mesh position={[0, 10 * s, 0]}>
        <coneGeometry args={[9.3 * s, 20.2 * s, 4]} />
        <meshBasicMaterial color={mat.color} transparent opacity={0.05} wireframe />
      </mesh>
    </group>
  )
}

function Pagoda({ s, mat, accent }: { s: number; mat: Mat; accent?: string }) {
  const levels = 5
  return (
    <group>
      {Array.from({ length: levels }, (_, i) => {
        const r = (levels - i) * 2.2 * s
        const y = i * 5.5 * s
        return (
          <group key={i}>
            {/* Walls */}
            <mesh position={[0, y + 2 * s, 0]}>
              <cylinderGeometry args={[r * 0.65, r * 0.75, 3.5 * s, 8]} />
              <meshStandardMaterial {...mat} roughness={0.6} />
            </mesh>
            {/* Roof — wider, curved overhang */}
            <mesh position={[0, y + 4.2 * s, 0]}>
              <cylinderGeometry args={[r * 0.3, r * 1.3, 1.2 * s, 8]} />
              <meshStandardMaterial
                color={accent || mat.color}
                emissive={accent || mat.color}
                emissiveIntensity={0.15}
                roughness={0.35}
              />
            </mesh>
          </group>
        )
      })}
      {/* Top spire */}
      <mesh position={[0, levels * 5.5 * s + 1 * s, 0]}>
        <coneGeometry args={[0.6 * s, 4 * s, 8]} />
        <meshStandardMaterial color={accent || '#daa520'} emissive={accent || '#daa520'} emissiveIntensity={0.4} metalness={0.5} roughness={0.2} />
      </mesh>
    </group>
  )
}

function Wall({ s, mat }: { s: number; mat: Mat }) {
  return (
    <group>
      {/* Main wall with crenellations */}
      <mesh position={[0, 3 * s, 0]}>
        <boxGeometry args={[80 * s, 6 * s, 3.5 * s]} />
        <meshStandardMaterial {...mat} roughness={0.85} />
      </mesh>
      {/* Crenellations */}
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={i} position={[-38 * s + i * 5 * s, 6.8 * s, 0]}>
          <boxGeometry args={[2 * s, 1.5 * s, 3.8 * s]} />
          <meshStandardMaterial color={mat.color} roughness={0.8} />
        </mesh>
      ))}
      {/* Watchtowers at ends */}
      {[-40, 40].map((x) => (
        <group key={x}>
          <mesh position={[x * s, 5 * s, 0]}>
            <cylinderGeometry args={[3 * s, 3.5 * s, 10 * s, 8]} />
            <meshStandardMaterial {...mat} roughness={0.7} />
          </mesh>
          <mesh position={[x * s, 10.5 * s, 0]}>
            <coneGeometry args={[3.5 * s, 2 * s, 8]} />
            <meshStandardMaterial {...mat} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Arch({ s, mat }: { s: number; mat: Mat }) {
  return (
    <group>
      {/* Two pillars */}
      {[-5, 5].map((x) => (
        <mesh key={x} position={[x * s, 7 * s, 0]}>
          <boxGeometry args={[3 * s, 14 * s, 4 * s]} />
          <meshStandardMaterial {...mat} roughness={0.5} />
        </mesh>
      ))}
      {/* Attic */}
      <mesh position={[0, 14.5 * s, 0]}>
        <boxGeometry args={[13 * s, 3 * s, 5 * s]} />
        <meshStandardMaterial {...mat} emissiveIntensity={0.15} roughness={0.45} />
      </mesh>
      {/* Relief detailing */}
      <mesh position={[0, 8 * s, 2.2 * s]}>
        <boxGeometry args={[7 * s, 10 * s, 0.3 * s]} />
        <meshStandardMaterial color={mat.color} roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  )
}

function Gate({ s, mat }: { s: number; mat: Mat }) {
  return (
    <group>
      {[-6, 6].map((x) => (
        <mesh key={x} position={[x * s, 8 * s, 0]}>
          <cylinderGeometry args={[1.2 * s, 1.5 * s, 16 * s, 10]} />
          <meshStandardMaterial {...mat} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 16.5 * s, 0]}>
        <boxGeometry args={[14 * s, 2 * s, 2.5 * s]} />
        <meshStandardMaterial {...mat} emissiveIntensity={0.15} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Torii({ s, mat }: { s: number; mat: Mat }) {
  return (
    <group>
      {/* Two pillars tapering slightly */}
      {[-5.5, 5.5].map((x) => (
        <mesh key={x} position={[x * s, 7 * s, 0]}>
          <cylinderGeometry args={[0.8 * s, 1 * s, 14 * s, 10]} />
          <meshStandardMaterial {...mat} roughness={0.3} />
        </mesh>
      ))}
      {/* Kasagi — curved top beam */}
      <mesh position={[0, 14.5 * s, 0]}>
        <boxGeometry args={[15 * s, 1 * s, 1.5 * s]} />
        <meshStandardMaterial {...mat} roughness={0.3} />
      </mesh>
      {/* Wing ends — angled up */}
      {[-8, 8].map((x) => (
        <mesh key={x} position={[x * s, 15.2 * s, 0]} rotation={[0, 0, x > 0 ? -0.3 : 0.3]}>
          <boxGeometry args={[2 * s, 0.8 * s, 1.5 * s]} />
          <meshStandardMaterial {...mat} roughness={0.3} />
        </mesh>
      ))}
      {/* Nuki — lower crossbar */}
      <mesh position={[0, 11 * s, 0]}>
        <boxGeometry args={[12 * s, 0.6 * s, 1.2 * s]} />
        <meshStandardMaterial {...mat} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Bridge({ s, mat, accent }: { s: number; mat: Mat; accent?: string }) {
  return (
    <group>
      {/* Road deck */}
      <mesh position={[0, 8 * s, 0]}>
        <boxGeometry args={[60 * s, 1 * s, 6 * s]} />
        <meshStandardMaterial color={mat.color} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Two pylons */}
      {[-18, 18].map((x) => (
        <group key={x}>
          <mesh position={[x * s, 14 * s, 0]}>
            <boxGeometry args={[2 * s, 20 * s, 3 * s]} />
            <meshStandardMaterial {...mat} roughness={0.5} metalness={0.3} />
          </mesh>
          {/* Pylon top */}
          <mesh position={[x * s, 24.5 * s, 0]}>
            <coneGeometry args={[1.5 * s, 2 * s, 4]} />
            <meshStandardMaterial {...mat} roughness={0.4} />
          </mesh>
        </group>
      ))}
      {/* Cables */}
      {[-18, 18].map((px) =>
        [-28, -20, -12, 12, 20, 28].map((cx) => {
          const isOnSide = Math.sign(cx) === Math.sign(px) || px === 0
          if (!isOnSide && Math.abs(cx) > Math.abs(px)) return null
          return (
            <mesh key={`${px}-${cx}`} position={[(px + cx) / 2 * s, 14 * s, 0]}
              rotation={[0, 0, Math.atan2(6, Math.abs(cx - px)) * (cx > px ? -1 : 1)]}>
              <cylinderGeometry args={[0.08 * s, 0.08 * s, Math.abs(cx - px) * s * 0.7, 4]} />
              <meshStandardMaterial color={accent || '#aabbcc'} roughness={0.3} metalness={0.5} />
            </mesh>
          )
        })
      )}
      {/* Support pillars */}
      {[-25, -10, 10, 25].map((x) => (
        <mesh key={x} position={[x * s, 4 * s, 0]}>
          <cylinderGeometry args={[0.8 * s, 1 * s, 8 * s, 8]} />
          <meshStandardMaterial color={mat.color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function Obelisk({ s, mat }: { s: number; mat: Mat }) {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 1 * s, 0]}>
        <boxGeometry args={[5 * s, 2 * s, 5 * s]} />
        <meshStandardMaterial {...mat} roughness={0.6} />
      </mesh>
      {/* Shaft — tapered box */}
      <mesh position={[0, 17 * s, 0]}>
        <boxGeometry args={[2.5 * s, 30 * s, 2.5 * s]} />
        <meshStandardMaterial {...mat} roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Pyramidion (cap) */}
      <mesh position={[0, 33 * s, 0]}>
        <coneGeometry args={[1.8 * s, 4 * s, 4]} />
        <meshStandardMaterial color={mat.color} emissive={mat.emissive} emissiveIntensity={0.4} roughness={0.2} metalness={0.4} />
      </mesh>
    </group>
  )
}

function Eiffel({ s, mat }: { s: number; mat: Mat }) {
  const legAngle = 0.12
  return (
    <group>
      {/* 4 legs */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([dx, dz], i) => (
        <mesh key={i}
          position={[dx * 4 * s, 10 * s, dz * 4 * s]}
          rotation={[dz * legAngle, 0, -dx * legAngle]}>
          <boxGeometry args={[1.5 * s, 22 * s, 1.5 * s]} />
          <meshStandardMaterial {...mat} roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      {/* First platform */}
      <mesh position={[0, 12 * s, 0]}>
        <boxGeometry args={[10 * s, 0.8 * s, 10 * s]} />
        <meshStandardMaterial {...mat} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Middle section */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([dx, dz], i) => (
        <mesh key={`m${i}`}
          position={[dx * 2 * s, 22 * s, dz * 2 * s]}
          rotation={[dz * 0.04, 0, -dx * 0.04]}>
          <boxGeometry args={[1 * s, 14 * s, 1 * s]} />
          <meshStandardMaterial {...mat} roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      {/* Second platform */}
      <mesh position={[0, 24 * s, 0]}>
        <boxGeometry args={[5 * s, 0.6 * s, 5 * s]} />
        <meshStandardMaterial {...mat} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Upper shaft */}
      <mesh position={[0, 32 * s, 0]}>
        <boxGeometry args={[1.2 * s, 14 * s, 1.2 * s]} />
        <meshStandardMaterial {...mat} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Antenna spire */}
      <mesh position={[0, 40 * s, 0]}>
        <coneGeometry args={[0.3 * s, 4 * s, 6]} />
        <meshStandardMaterial {...mat} emissiveIntensity={0.3} metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Beacon light */}
      <pointLight position={[0, 40 * s, 0]} intensity={0.6} distance={40} color="#ffdd88" />
    </group>
  )
}

function SkyscraperCluster({ s, mat, accent }: { s: number; mat: Mat; accent?: string }) {
  const towers = [
    { x: 0, z: 0, h: 25, w: 3, cyl: false },
    { x: 5, z: 3, h: 18, w: 2.5, cyl: true },
    { x: -4, z: 4, h: 20, w: 2.8, cyl: false },
    { x: 3, z: -4, h: 15, w: 2.2, cyl: false },
    { x: -3, z: -3, h: 22, w: 2, cyl: true },
  ]
  return (
    <group>
      {towers.map((t, i) => (
        <group key={i} position={[t.x * s, t.h * s / 2, t.z * s]}>
          {t.cyl ? (
            <mesh>
              <cylinderGeometry args={[t.w * s / 2, t.w * s / 2 * 1.05, t.h * s, 16]} />
              <meshStandardMaterial {...mat} roughness={0.15} metalness={0.6} />
            </mesh>
          ) : (
            <mesh>
              <boxGeometry args={[t.w * s, t.h * s, t.w * s * 0.8]} />
              <meshStandardMaterial {...mat} roughness={0.15} metalness={0.6} />
            </mesh>
          )}
          {/* Antenna */}
          {i === 0 && (
            <mesh position={[0, t.h * s / 2 + 2 * s, 0]}>
              <coneGeometry args={[0.2 * s, 4 * s, 4]} />
              <meshStandardMaterial color={accent || '#888888'} roughness={0.3} metalness={0.5} />
            </mesh>
          )}
        </group>
      ))}
      <pointLight position={[0, 20 * s, 0]} intensity={0.5} distance={30} color={accent || '#aabbdd'} />
    </group>
  )
}

function Minaret({ s, mat }: { s: number; mat: Mat }) {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 3 * s, 0]}>
        <cylinderGeometry args={[2.5 * s, 3 * s, 6 * s, 12]} />
        <meshStandardMaterial {...mat} roughness={0.6} />
      </mesh>
      {/* Main shaft */}
      <mesh position={[0, 15 * s, 0]}>
        <cylinderGeometry args={[1.5 * s, 2 * s, 18 * s, 12]} />
        <meshStandardMaterial {...mat} roughness={0.5} />
      </mesh>
      {/* Balcony */}
      <mesh position={[0, 22 * s, 0]}>
        <cylinderGeometry args={[3 * s, 1.5 * s, 1 * s, 12]} />
        <meshStandardMaterial {...mat} roughness={0.4} />
      </mesh>
      {/* Upper shaft */}
      <mesh position={[0, 26 * s, 0]}>
        <cylinderGeometry args={[1 * s, 1.2 * s, 6 * s, 10]} />
        <meshStandardMaterial {...mat} roughness={0.45} />
      </mesh>
      {/* Cone cap */}
      <mesh position={[0, 30 * s, 0]}>
        <coneGeometry args={[1.5 * s, 3 * s, 10]} />
        <meshStandardMaterial {...mat} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Crescent */}
      <mesh position={[0, 32 * s, 0]}>
        <sphereGeometry args={[0.4 * s, 8, 8]} />
        <meshStandardMaterial color="#daa520" emissive="#daa520" emissiveIntensity={0.5} metalness={0.7} roughness={0.1} />
      </mesh>
    </group>
  )
}

function StatueBase({ s, mat }: { s: number; mat: Mat }) {
  return (
    <group>
      {/* Stepped base */}
      <mesh position={[0, 1 * s, 0]}>
        <boxGeometry args={[10 * s, 2 * s, 10 * s]} />
        <meshStandardMaterial {...mat} roughness={0.7} />
      </mesh>
      <mesh position={[0, 3 * s, 0]}>
        <boxGeometry args={[8 * s, 2 * s, 8 * s]} />
        <meshStandardMaterial {...mat} roughness={0.6} />
      </mesh>
      {/* Pedestal */}
      <mesh position={[0, 6 * s, 0]}>
        <boxGeometry args={[4 * s, 4 * s, 4 * s]} />
        <meshStandardMaterial {...mat} roughness={0.5} />
      </mesh>
      {/* Abstract figure */}
      <mesh position={[0, 10 * s, 0]}>
        <cylinderGeometry args={[1.2 * s, 1.8 * s, 4 * s, 8]} />
        <meshStandardMaterial color="#887766" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 13 * s, 0]}>
        <sphereGeometry args={[1.5 * s, 10, 10]} />
        <meshStandardMaterial color="#887766" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  )
}

function Fortress({ s, mat }: { s: number; mat: Mat }) {
  return (
    <group>
      {/* Walls forming a square */}
      {[
        { pos: [0, 3 * s, -15 * s] as [number, number, number], args: [30 * s, 6 * s, 1.5 * s] as [number, number, number] },
        { pos: [0, 3 * s, 15 * s] as [number, number, number], args: [30 * s, 6 * s, 1.5 * s] as [number, number, number] },
        { pos: [-15 * s, 3 * s, 0] as [number, number, number], args: [1.5 * s, 6 * s, 30 * s] as [number, number, number] },
        { pos: [15 * s, 3 * s, 0] as [number, number, number], args: [1.5 * s, 6 * s, 30 * s] as [number, number, number] },
      ].map((w, i) => (
        <mesh key={i} position={w.pos}>
          <boxGeometry args={w.args} />
          <meshStandardMaterial {...mat} roughness={0.8} />
        </mesh>
      ))}
      {/* Corner towers */}
      {[[-15, -15], [-15, 15], [15, -15], [15, 15]].map(([x, z], i) => (
        <group key={i}>
          <mesh position={[x * s, 5 * s, z * s]}>
            <cylinderGeometry args={[2.5 * s, 3 * s, 10 * s, 8]} />
            <meshStandardMaterial {...mat} roughness={0.7} />
          </mesh>
          <mesh position={[x * s, 10.5 * s, z * s]}>
            <coneGeometry args={[3 * s, 2.5 * s, 8]} />
            <meshStandardMaterial {...mat} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
