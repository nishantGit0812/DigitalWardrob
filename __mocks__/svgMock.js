// Jest manual mock for `.svg` imports (jest.config.js's moduleNameMapper).
// Jest doesn't run files through Metro, so react-native-svg-transformer
// never sees these imports under test — this stands in as the same "default
// export is a component" shape, matching the ambient `*.svg` module
// declaration in src/shared/types/svg.d.ts.
const React = require('react');

function SvgMock(props) {
  return React.createElement('SvgMock', props);
}

module.exports = SvgMock;
module.exports.default = SvgMock;
