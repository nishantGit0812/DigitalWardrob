import { FadeInUp, LinearTransition } from 'react-native-reanimated';
import { useReducedMotionPreference } from '../../../shared/hooks/useReducedMotionPreference';

const TILE_ENTER_DURATION_MS = 220;
const TILE_ENTER_STAGGER_MS = 40;
const TILE_LAYOUT_DURATION_MS = 220;

// Backs the profile grid's entry (mount) and reorder (add/delete shifting
// sibling tiles) transitions (spec.md §28a.7, requirements.md's "profile
// grid transitions"). Mirrors BiometricGateScreen's reduced-motion pairing:
// both props resolve to `undefined` when the system setting is on, which
// Reanimated treats as "skip the animation" rather than an empty animation.
export function useGridTileMotion(index: number) {
  const reduceMotionEnabled = useReducedMotionPreference();

  if (reduceMotionEnabled) {
    return { entering: undefined, layout: undefined };
  }

  return {
    entering: FadeInUp.delay(index * TILE_ENTER_STAGGER_MS).duration(
      TILE_ENTER_DURATION_MS,
    ),
    layout: LinearTransition.duration(TILE_LAYOUT_DURATION_MS),
  };
}
