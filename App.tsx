/**
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import {
  ThemeModeProvider,
  darkNavigationTheme,
  darkTheme,
  lightNavigationTheme,
  lightTheme,
  useThemeMode,
} from './src/app/theme';
import { NativeBiometricGateway } from './src/features/profiles/data/biometricGateway';
import { BiometricGateProvider } from './src/features/profiles/presentation/BiometricGateContext';

// Composition root: the only place the concrete Data-layer gateway is
// imported and handed to Presentation via context (spec.md §18a).
const biometricGateway = new NativeBiometricGateway();

function ThemedApp() {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <PaperProvider theme={isDark ? darkTheme : lightTheme}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer
        theme={isDark ? darkNavigationTheme : lightNavigationTheme}
      >
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <BiometricGateProvider gateway={biometricGateway}>
        <ThemeModeProvider>
          <ThemedApp />
        </ThemeModeProvider>
      </BiometricGateProvider>
    </SafeAreaProvider>
  );
}

export default App;
