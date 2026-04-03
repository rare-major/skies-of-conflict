import { useFrame } from '@react-three/fiber'
import { useReplayStore } from '../store/replayStore'
import { useSimulationStore } from '../store/simulationStore'
import { useEntityStore } from '../store/entityStore'

export function useReplaySystem() {
  // Replay playback -- restores both positions AND statuses from recorded frames
  useFrame(() => {
    const replay = useReplayStore.getState()
    if (!replay.isReplaying || replay.frames.length === 0) return

    const timeScale = useSimulationStore.getState().timeScale
    replay.advanceFrame(Math.max(1, Math.round(timeScale)))

    const frame = replay.frames[replay.currentFrameIndex]
    if (!frame) return

    const store = useEntityStore.getState()

    for (const snapshot of frame.entities) {
      if (snapshot.kind === 'interceptor') {
        store.updateInterceptorPosition(snapshot.id, snapshot.position, snapshot.velocity)
        store.setInterceptorStatus(snapshot.id, snapshot.status)
      } else {
        store.updateEntityPosition(snapshot.id, snapshot.position, snapshot.velocity)
        store.setEntityStatus(snapshot.id, snapshot.status)
      }
    }

    if (replay.currentFrameIndex >= replay.frames.length - 1) {
      replay.stopReplay()
    }
  })
}
