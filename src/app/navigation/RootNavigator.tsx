import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BiometricGateScreen } from '../../features/profiles/presentation/BiometricGateScreen';
import { CreateProfileScreen } from '../../features/profiles/presentation/CreateProfileScreen';
import { ProfileSelectionScreen } from '../../features/profiles/presentation/ProfileSelectionScreen';
import { MainTabs } from './MainTabs';

// Phase 1 flow: BiometricGate -> ProfileSelection -> (optionally
// CreateProfile) -> MainTabs. No PIN gate yet (Task Group 5 inserts PIN
// Entry between ProfileSelection and MainTabs).
export type RootStackParamList = {
  BiometricGate: undefined;
  ProfileSelection: undefined;
  CreateProfile: undefined;
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
      onAuthenticated={() => navigation.replace('ProfileSelection')}
    />
  );
}

type ProfileSelectionRouteProps = NativeStackScreenProps<
  RootStackParamList,
  'ProfileSelection'
>;

function ProfileSelectionRoute({ navigation }: ProfileSelectionRouteProps) {
  return (
    <ProfileSelectionScreen
      onProfileSelected={() =>
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
      }
      onAddProfile={() => navigation.navigate('CreateProfile')}
    />
  );
}

type CreateProfileRouteProps = NativeStackScreenProps<
  RootStackParamList,
  'CreateProfile'
>;

function CreateProfileRoute({ navigation }: CreateProfileRouteProps) {
  return (
    <CreateProfileScreen
      onCreated={() =>
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
      }
    />
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BiometricGate" component={BiometricGateRoute} />
      <Stack.Screen name="ProfileSelection" component={ProfileSelectionRoute} />
      <Stack.Screen name="CreateProfile" component={CreateProfileRoute} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}
