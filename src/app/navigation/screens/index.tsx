import { PlaceholderScreen } from './PlaceholderScreen';

// One named component per tab (roadmap.md's Phase 0.5 tab set), so each
// can be swapped for its real screen individually in a later phase without
// touching MainTabs' registration.
export const WardrobeScreen = () => <PlaceholderScreen title="Wardrobe" />;
export const OutfitsScreen = () => <PlaceholderScreen title="Outfits" />;
export const PlannerScreen = () => <PlaceholderScreen title="Planner" />;
export const StatisticsScreen = () => <PlaceholderScreen title="Statistics" />;
export const SettingsScreen = () => <PlaceholderScreen title="Settings" />;
