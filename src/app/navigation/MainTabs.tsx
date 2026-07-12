import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  OutfitsScreen,
  PlannerScreen,
  SettingsScreen,
  StatisticsScreen,
  WardrobeScreen,
} from './screens';

export type MainTabsParamList = {
  Wardrobe: undefined;
  Outfits: undefined;
  Planner: undefined;
  Statistics: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Wardrobe" component={WardrobeScreen} />
      <Tab.Screen name="Outfits" component={OutfitsScreen} />
      <Tab.Screen name="Planner" component={PlannerScreen} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
