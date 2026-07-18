/**
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { ThemeModeProvider, useAppTheme } from './src/app/theme';
import { NativeBiometricGateway } from './src/features/profiles/data/biometricGateway';
import { LocalProfileRepository } from './src/features/profiles/data/profileRepository';
import { NativeProfilePinGateway } from './src/features/profiles/data/profilePinGateway';
import { BiometricGateProvider } from './src/features/profiles/presentation/BiometricGateContext';
import { ProfilePinProvider } from './src/features/profiles/presentation/ProfilePinContext';
import { ProfileRepositoryProvider } from './src/features/profiles/presentation/ProfileRepositoryContext';

// Composition root: the only place the concrete Data-layer implementations
// are imported and handed to Presentation via context (spec.md §18a).
const biometricGateway = new NativeBiometricGateway();
const profilePinGateway = new NativeProfilePinGateway();
const profileRepository = new LocalProfileRepository(profilePinGateway);

function ThemedApp() {
  const { isDark, paperTheme, navigationTheme } = useAppTheme();

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

function App() {
  return (
    // Required root wrapper for react-native-gesture-handler (Task Group 5's
    // BottomSheet is its first consumer, spec.md §45.6) — must sit above
    // every other provider per the library's own setup docs.
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <BiometricGateProvider gateway={biometricGateway}>
          <ProfilePinProvider gateway={profilePinGateway}>
            <ProfileRepositoryProvider repository={profileRepository}>
              <ThemeModeProvider>
                <ThemedApp />
              </ThemeModeProvider>
            </ProfileRepositoryProvider>
          </ProfilePinProvider>
        </BiometricGateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
