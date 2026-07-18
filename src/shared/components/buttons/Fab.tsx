import type { ComponentProps, ComponentType } from 'react';
import { FAB as PaperFAB } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { SvgProps } from 'react-native-svg';
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference';

const AnimatedPaperFAB = Animated.createAnimatedComponent(PaperFAB);

const PRESS_SCALE = 0.94;
const PRESS_SPRING = { damping: 15, stiffness: 300 };

export interface FabProps
  extends Omit<ComponentProps<typeof PaperFAB>, 'icon' | 'size'> {
  icon: ComponentType<SvgProps>;
  /** @default 'medium' (`height-fab-default`/56dp, spec.md §44.9) */
  size?: 'small' | 'medium' | 'large';
}

// docs/spec.md §45.1 — `size="medium"` alone already reproduces
// `height-fab-default`/56dp and `radius-lg`/16dp (Paper's v3MediumSize +
// `4 * theme.roundness`, confirmed against FAB/utils.ts with this app's
// roundness of 4), and `elevation-3` resting is Paper's own default MD3
// FAB elevation. The one real delta: Paper's `FAB` exposes no
// onPressIn/onPressOut to hook a press-scale animation onto, so the spec's
// scale-to-0.94-then-spring feedback plays as a full down/up sequence
// triggered from `onPress` rather than tracking the physical finger-down
// moment — collapses to an instant, unanimated call under reduced motion
// (spec.md §28a.7).
export function Fab({
  icon: Icon,
  onPress,
  size = 'medium',
  style,
  ...rest
}: FabProps) {
  const scale = useSharedValue(1);
  const reduceMotionEnabled = useReducedMotionPreference();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPaperFAB
      {...rest}
      // Paper's `IconSource` render-prop contract (Icon.d.ts) is itself a
      // function invoked inline each render, not a component type held
      // across renders — not the unstable-component pattern this rule
      // targets.
      // eslint-disable-next-line react/no-unstable-nested-components
      icon={({ size: iconSize, color }) => (
        <Icon width={iconSize} height={iconSize} color={color} />
      )}
      size={size}
      style={[animatedStyle, style]}
      onPress={event => {
        if (reduceMotionEnabled) {
          onPress?.(event);
          return;
        }
        scale.value = withSequence(
          withTiming(PRESS_SCALE, { duration: 100 }),
          withSpring(1, PRESS_SPRING),
        );
        onPress?.(event);
      }}
    />
  );
}
