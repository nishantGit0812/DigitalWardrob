const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
// react-native-svg-transformer (spec.md §60.1): every icon/illustration in
// this app is consumed as an SVG-turned-React-component, never a raster —
// so `.svg` moves out of Metro's asset pipeline and through this
// transformer instead, matching Task Group 1's "no static asset without a
// named source" discipline for the icon set.
const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
