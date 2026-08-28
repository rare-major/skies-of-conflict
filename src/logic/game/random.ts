let state = 0x6d2b79f5

export function setSimulationSeed(seed: number) {
  state = (seed >>> 0) || 0x6d2b79f5
}

/** Mulberry32: compact, deterministic and sufficient for repeatable simulation rolls. */
export function simulationRandom(): number {
  state |= 0
  state = (state + 0x6d2b79f5) | 0
  let value = Math.imul(state ^ (state >>> 15), 1 | state)
  value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296
}

