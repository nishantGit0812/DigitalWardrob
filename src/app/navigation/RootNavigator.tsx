import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BiometricGateScreen } from '../../features/profiles/presentation/BiometricGateScreen';
import { MainTabs } from './MainTabs';

// Phase 1 (plan.md 1.2) inserts the biometric gate ahead of MainTabs; the
// profile-selection screen (Task Group 3) will sit between them once it
// exists — for now a successful gate routes straight into MainTabs.
export type RootStackParamList = {
  BiometricGate: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type BiometricGateRouteProps = NativeStackScreenProps<
  RootStackParamList,
  'BiometricGate'
>;

// Adapts the Presentation-layer screen's plain `onAuthenticated` callback to
// this stack's navigation — keeps BiometricGateScreen itself decoupled from
// React Navigation.
function BiometricGateRoute({ navigation }: BiometricGateRouteProps) {
  return (
    <BiometricGateScreen
      onAuthenticated={() => navigation.replace('MainTabs')}
    />
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BiometricGate" component={BiometricGateRoute} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}
