import { useEffect, useState, type ReactNode } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Portal, Surface } from 'react-native-paper';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { easingCurve, radius, stateOpacity, zIndex } from '../../../app/theme';
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference';

// spec.md §45.6's "Enter: ... 300ms emphasized-decelerate" names a curve
// tokens.ts's own `easingCurve` doesn't list under `duration-medium-2`
// (that entry is labeled `standard-decelerate`, which — per tokens.ts's own
// header comment — has no concrete formula yet either). Between the two
// unresolved labels, this component follows the spec prose's explicit
// "emphasized-decelerate" naming for *this* transition, since
// `easingCurve.emphasizedDecelerate` is one of the two curves §44.13
// actually gives a formula for.
//
// tokens.ts stores that curve as a CSS `cubic-bezier(...)` string (for
// parity with the Figma/CSS side of the design source, §58.2) rather than
// a callable Reanimated `Easing` function, so it's parsed here into one via
// `Easing.bezier` rather than hardcoding the same four numbers again.
function parseCubicBezier(cssValue: string) {
  const match = /cubic-bezier\(([^,]+),([^,]+),([^,]+),([^)]+)\)/.exec(
    cssValue,
  );
  if (!match) {
    throw new Error(`Not a cubic-bezier() value: ${cssValue}`);
  }
  const [x1, y1, x2, y2] = match.slice(1, 5).map(Number);
  return Easing.bezier(x1, y1, x2, y2);
}

const ENTER_EASING = parseCubicBezier(easingCurve.emphasizedDecelerate);
const ENTER_DURATION_MS = 300;
const EXIT_DURATION_MS = 200;
const VELOCITY_DISMISS_THRESHOLD = 800; // dp/s, spec.md §45.6
const DISMISS_HEIGHT_FRACTION = 0.5;

// Pure so the drag-to-dismiss decision is unit-testable without simulating
// an actual native pan gesture (react-native-gesture-handler's Jest mocks
// stub out real touch recognition — this is the one piece of that decision
// that doesn't need a device to verify).
export function shouldDismissBottomSheet(
  translationY: number,
  velocityY: number,
  sheetHeight: number,
): boolean {
  return (
    velocityY > VELOCITY_DISMISS_THRESHOLD ||
    translationY > sheetHeight * DISMISS_HEIGHT_FRACTION
  );
}

export interface BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
  /** Tapping the scrim dismisses by default, matching Dialog's `dismissable`. */
  dismissable?: boolean;
  testID?: string;
}

// docs/spec.md §45.6 — no Paper default exists for this component (unlike
// every other entry in this section) despite the spec's "(Paper default,
// themed)" label; confirmed against react-native-paper's own component
// list. Built from Portal + Surface (for theming/elevation parity with the
// rest of the overlay set) and react-native-gesture-handler's `Gesture.Pan`
// for 1:1 drag-to-dismiss, since neither exists in this app until this
// component needs it.
export function BottomSheet({
  visible,
  onDismiss,
  children,
  dismissable = true,
  testID = 'bottom-sheet',
}: BottomSheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const reduceMotionEnabled = useReducedMotionPreference();
  const [rendered, setRendered] = useState(visible);
  const [sheetHeight, setSheetHeight] = useState(windowHeight);
  const translateY = useSharedValue(windowHeight);
  const dragStart = useSharedValue(0);

  // Shared by the gesture/scrim-triggered dismiss and the effect below (a
  // parent flipping `visible` to `false` on its own) — both need the same
  // animate-then-unmount sequencing so the sheet is never removed mid-
  // slide. Only the former also reports back to the parent via `onDismiss`;
  // the latter is the parent *already* telling us to close.
  const animateClosed = (notifyParent: boolean) => {
    translateY.value = withTiming(
      sheetHeight,
      { duration: reduceMotionEnabled ? 0 : EXIT_DURATION_MS },
      finished => {
        'worklet';
        if (finished) {
          runOnJS(setRendered)(false);
          if (notifyParent) {
            runOnJS(onDismiss)();
          }
        }
      },
    );
  };

  useEffect(() => {
    if (visible) {
      setRendered(true);
      translateY.value = withTiming(0, {
        duration: reduceMotionEnabled ? 0 : ENTER_DURATION_MS,
        easing: ENTER_EASING,
      });
    } else if (rendered) {
      animateClosed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Only tracks height for the exit target / drag-dismiss threshold below —
  // must never touch `translateY` itself, or a layout pass arriving mid-
  // enter-animation would snap the sheet to its final position instead of
  // letting the slide play out.
  const handleLayout = (event: LayoutChangeEvent) => {
    setSheetHeight(event.nativeEvent.layout.height);
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      dragStart.value = translateY.value;
    })
    .onUpdate(event => {
      translateY.value = Math.max(0, dragStart.value + event.translationY);
    })
    .onEnd(event => {
      if (
        shouldDismissBottomSheet(translateY.value, event.velocityY, sheetHeight)
      ) {
        runOnJS(animateClosed)(true);
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!rendered) {
    return null;
  }

  return (
    <Portal>
      <Pressable
        testID={`${testID}-scrim`}
        onPress={dismissable ? () => animateClosed(true) : undefined}
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: `rgba(0, 0, 0, ${stateOpacity.scrim})`,
            zIndex: zIndex.overlayScrim,
          },
        ]}
      />
      <GestureDetector gesture={pan}>
        <Animated.View
          testID={testID}
          onLayout={handleLayout}
          style={[styles.sheet, { zIndex: zIndex.overlayContent }, sheetStyle]}
        >
          {/* Elevation/shadow lives on this outer Surface; corner-clipping
              lives on the inner View — Paper warns that combining
              `overflow: hidden` with a Surface's own shadow on one node
              breaks the shadow rendering. */}
          <Surface style={styles.surface} elevation={1}>
            <View style={styles.clip}>{children}</View>
          </Surface>
        </Animated.View>
      </GestureDetector>
    </Portal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  surface: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  clip: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
  },
});
