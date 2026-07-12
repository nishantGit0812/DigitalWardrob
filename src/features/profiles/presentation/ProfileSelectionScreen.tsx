import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Profile } from '../domain/Profile';
import { MAX_PROFILES } from '../domain/profileRepository';
import { AddProfileTile } from './AddProfileTile';
import { useProfileRepository } from './ProfileRepositoryContext';
import { ProfileTile } from './ProfileTile';

interface ProfileSelectionScreenProps {
  onProfileSelected: (profile: Profile) => void;
  onAddProfile: () => void;
}

// Grid of up to MAX_PROFILES profile tiles plus an Add Profile action
// (plan.md 3.1). A plain wrapping flexbox rather than FlashList/FlatList —
// at most 5 tiles ever render, so there's nothing to virtualize, and a
// plain View lets the Add Profile tile reflow into the grid instead of
// sitting in a separate footer row. No PIN gate yet: Task Group 5 will
// insert PIN Entry between selecting a tile and onProfileSelected firing;
// for now selection goes straight through.
export function ProfileSelectionScreen({
  onProfileSelected,
  onAddProfile,
}: ProfileSelectionScreenProps) {
  const repository = useProfileRepository();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [profiles, setProfiles] = useState<Profile[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    repository.list().then(result => {
      if (!cancelled) {
        setProfiles(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [repository]);

  const handleSelect = useCallback(
    (profile: Profile) => {
      repository.setActiveProfileId(profile.id);
      onProfileSelected(profile);
    },
    [repository, onProfileSelected],
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
        {profiles.map(profile => (
          <ProfileTile
            key={profile.id}
            profile={profile}
            onPress={() => handleSelect(profile)}
          />
        ))}
        <AddProfileTile
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
