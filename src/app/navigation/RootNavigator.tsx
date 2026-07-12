import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Profile } from '../../features/profiles/domain/Profile';
import { BiometricGateScreen } from '../../features/profiles/presentation/BiometricGateScreen';
import { CreateProfileScreen } from '../../features/profiles/presentation/CreateProfileScreen';
import { EditProfileScreen } from '../../features/profiles/presentation/EditProfileScreen';
import { PinEntryScreen } from '../../features/profiles/presentation/PinEntryScreen';
import { PinSetupScreen } from '../../features/profiles/presentation/PinSetupScreen';
import { ProfileSelectionScreen } from '../../features/profiles/presentation/ProfileSelectionScreen';
import { useProfileRepository } from '../../features/profiles/presentation/ProfileRepositoryContext';
import { MainTabs } from './MainTabs';

// Phase 1 flow: BiometricGate -> ProfileSelection -> (optionally
// CreateProfile/EditProfile, and for PIN-protected profiles PinEntry, with
// PinEntry's "Forgot PIN?" looping back through the biometric gate into
// PinSetup) -> MainTabs.
export type RootStackParamList = {
  BiometricGate: undefined;
  ProfileSelection: undefined;
  CreateProfile: undefined;
  EditProfile: { profileId: string; name: string; avatarColor: string };
  PinEntry: { profileId: string; name: string };
  ForgotPin: { profileId: string; name: string };
  PinSetup: {
    profileId: string;
    name: string;
    // Create/forgot-PIN reset both land in MainTabs; enabling PIN
    // protection from Edit Profile returns to Profile Selection instead
    // (matching EditProfileScreen's own onSaved/onDeleted goBack()).
    onSuccessTarget: 'mainTabs' | 'goBack';
  };
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
      onPinRequired={(profile: Profile) =>
        navigation.navigate('PinEntry', {
          profileId: profile.id,
          name: profile.name,
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
      onCreated={(profile, wantsPin) => {
        if (wantsPin) {
          navigation.replace('PinSetup', {
            profileId: profile.id,
            name: profile.name,
            onSuccessTarget: 'mainTabs',
          });
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        }
      }}
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
      onSetupPin={updatedProfile =>
        navigation.replace('PinSetup', {
          profileId: updatedProfile.id,
          name: updatedProfile.name,
          onSuccessTarget: 'goBack',
        })
      }
    />
  );
}

type PinEntryRouteProps = NativeStackScreenProps<
  RootStackParamList,
  'PinEntry'
>;

function PinEntryRoute({ navigation, route }: PinEntryRouteProps) {
  const { profileId, name } = route.params;
  return (
    <PinEntryScreen
      profileId={profileId}
      profileName={name}
      onVerified={() =>
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
      }
      onForgotPin={() => navigation.navigate('ForgotPin', { profileId, name })}
    />
  );
}

type ForgotPinRouteProps = NativeStackScreenProps<
  RootStackParamList,
  'ForgotPin'
>;

// Re-invokes Task Group 1's biometric gate (plan.md 5.4) — re-verifying
// biometrics is treated as sufficient proof of device-owner identity
// (requirements.md FR-4b), so success routes straight into Set New PIN
// without requiring the old PIN.
function ForgotPinRoute({ navigation, route }: ForgotPinRouteProps) {
  const { profileId, name } = route.params;
  return (
    <BiometricGateScreen
      onAuthenticated={() =>
        navigation.replace('PinSetup', {
          profileId,
          name,
          onSuccessTarget: 'mainTabs',
        })
      }
    />
  );
}

type PinSetupRouteProps = NativeStackScreenProps<
  RootStackParamList,
  'PinSetup'
>;

function PinSetupRoute({ navigation, route }: PinSetupRouteProps) {
  const repository = useProfileRepository();
  const { profileId, name, onSuccessTarget } = route.params;

  return (
    <PinSetupScreen
      profileId={profileId}
      profileName={name}
      onSaved={() => {
        if (onSuccessTarget === 'mainTabs') {
          // Covers both the create-flow (already active, harmless no-op
          // re-set) and the forgot-PIN reset flow (never went through
          // PinEntry's onVerified, so this is the only place it happens).
          repository.setActiveProfileId(profileId);
          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        } else {
          navigation.goBack();
        }
      }}
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
      <Stack.Screen name="PinEntry" component={PinEntryRoute} />
      <Stack.Screen name="ForgotPin" component={ForgotPinRoute} />
      <Stack.Screen name="PinSetup" component={PinSetupRoute} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}
