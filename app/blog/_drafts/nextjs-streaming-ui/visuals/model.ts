export type BoundaryMode = 'blocking' | 'single' | 'separate' | 'nested';
export type Delays = { body: number; comments: number };
export type Playback = { time: number; playing: boolean };
export type PlaybackAction =
  | { type: 'toggle' | 'restart' }
  | { type: 'tick'; delta: number; active: boolean };

export const duration = 3000;
export const restDuration = 2000;

export function createPlayback(): Playback {
  return { time: 0, playing: true };
}

export function viewAt(mode: BoundaryMode, time: number, delays: Delays) {
  const bodyReady = time >= delays.body;
  const commentsReady = time >= delays.comments;
  const outerReady = mode === 'separate' || (mode === 'nested' ? bodyReady : bodyReady && commentsReady);
  return {
    body: outerReady && bodyReady,
    comments: outerReady && commentsReady,
    outerFallback: !outerReady,
  };
}

export function playbackReducer(state: Playback, action: PlaybackAction): Playback {
  switch (action.type) {
    case 'restart': return { time: 0, playing: true };
    case 'toggle': return { ...state, playing: !state.playing };
    case 'tick': {
      if (!action.active || !state.playing || !Number.isFinite(action.delta) || action.delta < 0) return state;
      const time = (state.time + action.delta) % (duration + restDuration);
      return { time, playing: true };
    }
  }
}
