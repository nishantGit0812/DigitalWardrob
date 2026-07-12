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
      <ThemeModeProvider>
        <ThemedApp />
      </ThemeModeProvider>
    </SafeAreaProvider>
  );
}

export default App;
