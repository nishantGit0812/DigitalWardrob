// spec.md §46.3/§60.1 — pure byte-size reduction, no visual regression.
// The viewBox is never removed — `removeViewBox` isn't part of SVGO v4's
// `preset-default` bundle in the first place (confirmed against the
// installed version), so it's simply left out rather than "overridden",
// which SVGO warns about since preset-default has nothing to override.
// `removeDimensions: true` strips any width/height attribute so scaling is
// the *only* sizing source (no fixed px size baked into the file competing
// with react-native-svg's runtime scaling); `convertShapeToPath: false`
// leaves authored shapes (rect/circle) as shapes rather than converting
// them to paths, since this app's icons are already authored as a mix of
// paths and shapes on purpose.
module.exports = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          convertShapeToPath: false,
        },
      },
    },
    'removeDimensions',
  ],
};
