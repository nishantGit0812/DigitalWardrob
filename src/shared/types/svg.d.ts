// react-native-svg-transformer (metro.config.js) turns every `.svg` import
// into a React component accepting react-native-svg's `SvgProps` — this
// ambient module declaration is what makes that import shape typecheck,
// since TypeScript has no built-in knowledge of the Metro transform.
declare module '*.svg' {
  import type { FC } from 'react';
  import type { SvgProps } from 'react-native-svg';

  const content: FC<SvgProps>;
  export default content;
}
