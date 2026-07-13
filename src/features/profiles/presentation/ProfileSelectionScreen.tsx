import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Profile } from '../domain/Profile';
import { MAX_PROFILES } from '../domain/profileRepository';
import { AddProfileTile } from './AddProfileTile';
import { useProfilePinGateway } from './ProfilePinContext';
import { useProfileRepository } from './ProfileRepositoryContext';
import { ProfileTile } from './ProfileTile';

interface ProfileSelectionScreenProps {
  onProfileSelected: (profile: Profile) => void;
  onAddProfile: () => void;
  onEditProfile: (profile: Profile) => void;
  onPinRequired: (profile: Profile) => void;
}

// Grid of up to MAX_PROFILES profile tiles plus an Add Profile action
// (plan.md 3.1). A plain wrapping flexbox rather than FlashList/FlatList —
// at most 5 tiles ever render, so there's nothing to virtualize, and a
// plain View lets the Add Profile tile reflow into the grid instead of
// sitting in a separate footer row. A PIN-protected profile (FR-4a, opt-in
// per profile) routes to PIN Entry instead of straight through — and
// setActiveProfileId is deliberately deferred to that success path rather
// than fired here, so a profile is never marked active until it's actually
// been unlocked (plan.md 5.2).
export function ProfileSelectionScreen({
  onProfileSelected,
  onAddProfile,
  onEditProfile,
  onPinRequired,
}: ProfileSelectionScreenProps) {
  const repository = useProfileRepository();
  const pinGateway = useProfilePinGateway();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [profiles, setProfiles] = useState<Profile[] | null>(null);

  // Refetches on every focus, not just mount, so returning from
  // Create/Edit Profile (Task Group 4.1) shows the change — React
  // Navigation keeps this screen mounted-but-unfocused rather than
  // remounting it on `goBack()`.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      repository.list().then(result => {
        if (!cancelled) {
          setProfiles(result);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [repository]),
  );

  const handleSelect = useCallback(
    async (profile: Profile) => {
      const hasPin = await pinGateway.hasPin(profile.id);
      if (hasPin) {
        onPinRequired(profile);
        return;
      }
      repository.setActiveProfileId(profile.id);
      onProfileSelected(profile);
    },
    [pinGateway, repository, onProfileSelected, onPinRequired],
  );

  const containerStyle = [
    styles.container,
    { paddingTop: insets.top, backgroundColor: theme.colors.background },
  ];

  if (profiles === null) {
    return (
      <View style={[containerStyle, styles.centered]}>
        <ActivityIndicator size="large" accessibilityLabel="Loading profiles" />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Text
        variant="headlineSmall"
        accessibilityRole="header"
        style={styles.title}
      >
        Who&rsquo;s using WardrobeAI?
      </Text>
      <View style={styles.grid}>
        {profiles.map((profile, index) => (
          <ProfileTile
            key={profile.id}
            profile={profile}
            index={index}
            onPress={() => handleSelect(profile)}
            onEdit={() => onEditProfile(profile)}
          />
        ))}
        <AddProfileTile
          index={profiles.length}
          onPress={onAddProfile}
          disabled={profiles.length >= MAX_PROFILES}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginVertical: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
