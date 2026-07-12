import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';

// A single-screen root stack for now — Phase 1 adds the biometric gate and
// profile-selection screens ahead of MainTabs (spec.md §12) without this
// needing to change shape.
export type RootStackParamList = {
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}
