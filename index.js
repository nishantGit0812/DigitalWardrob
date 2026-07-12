/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { enableScreens } from 'react-native-screens';
import App from './App';
import { name as appName } from './app.json';

// Must run before any navigator renders — react-native-screens is not
// enabled automatically by React Navigation.
enableScreens();

AppRegistry.registerComponent(appName, () => App);
