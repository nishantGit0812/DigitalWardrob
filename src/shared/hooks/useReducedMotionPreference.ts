import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// Backs every reduced-motion branch in the app (spec.md §28a.7): reflects
// Android's system "Remove animations" setting and stays live via the
// change event so a mid-session toggle takes effect without a relaunch.
// First consumer is the biometric gate's enter/exit transition (plan.md
// 1.4) — later animated screens in this phase reuse this same hook.
export function useReducedMotionPreference(): boolean {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (isMounted) {
        setReduceMotionEnabled(enabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotionEnabled,
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotionEnabled;
}
