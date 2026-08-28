export interface TrackingState {
  targetId: string
  consecutiveDetections: number
  isTracked: boolean
  lastDetectionTime: number
}

const TRACKING_THRESHOLD = 3
const TRACKING_TIMEOUT = 2.0

/**
 * Update tracking state for a defence unit's view of a target.
 */
export function updateTracking(
  state: TrackingState | undefined,
  targetId: string,
  detected: boolean,
  currentTime: number
): TrackingState {
  if (!state) {
    return {
      targetId,
      consecutiveDetections: detected ? 1 : 0,
      isTracked: false,
      lastDetectionTime: detected ? currentTime : 0,
    }
  }

  if (detected) {
    const consecutive = state.consecutiveDetections + 1
    return {
      ...state,
      consecutiveDetections: consecutive,
      isTracked: consecutive >= TRACKING_THRESHOLD,
      lastDetectionTime: currentTime,
    }
  }

  // Lost detection
  if (currentTime - state.lastDetectionTime > TRACKING_TIMEOUT) {
    return { ...state, consecutiveDetections: 0, isTracked: false }
  }
  return state
}
