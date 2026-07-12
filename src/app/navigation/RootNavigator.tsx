import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Profile } from '../../features/profiles/domain/Profile';
import { BiometricGateScreen } from '../../features/profiles/presentation/BiometricGateScreen';
import { CreateProfileScreen } from '../../features/profiles/presentation/CreateProfileScreen';
import { EditProfileScreen } from '../../features/profiles/presentation/EditProfileScreen';
import { ProfileSelectionScreen } from '../../features/profiles/presentation/ProfileSelectionScreen';
import { MainTabs } from './MainTabs';

// Phase 1 flow: BiometricGate -> ProfileSelection -> (optionally
// CreateProfile/EditProfile) -> MainTabs. No PIN gate yet (Task Group 5
// inserts PIN Entry between ProfileSelection and MainTabs).
export type RootStackParamList = {
  BiometricGate: undefined;
  ProfileSelection: undefined;
  CreateProfile: undefined;
  EditProfile: { profileId: string; name: string; avatarColor: string };
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
      onEditProfile={(profile: Profile) =>
        navigation.navigate('EditProfile', {
          profileId: profile.id,
          name: profile.name,
          avatarColor: profile.avatarColor,
        })
      }
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

type EditProfileRouteProps = NativeStackScreenProps<
  RootStackParamList,
  'EditProfile'
>;

function EditProfileRoute({ navigation, route }: EditProfileRouteProps) {
  const profile: Profile = {
    id: route.params.profileId,
    name: route.params.name,
    avatarColor: route.params.avatarColor,
  };
  return (
    <EditProfileScreen
      profile={profile}
      onSaved={() => navigation.goBack()}
      onDeleted={() => navigation.goBack()}
    />
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BiometricGate" component={BiometricGateRoute} />
      <Stack.Screen name="ProfileSelection" component={ProfileSelectionRoute} />
      <Stack.Screen name="CreateProfile" component={CreateProfileRoute} />
      <Stack.Screen name="EditProfile" component={EditProfileRoute} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}
