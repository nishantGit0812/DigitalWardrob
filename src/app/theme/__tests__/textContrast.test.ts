import { pickReadableTextColor } from '../textContrast';

describe('pickReadableTextColor', () => {
  it('picks black text on a white background', () => {
    expect(pickReadableTextColor('#FFFFFF')).toBe('#000000');
  });

  it('picks white text on a black background', () => {
    expect(pickReadableTextColor('#000000')).toBe('#FFFFFF');
  });

  it('picks black text on a light, low-contrast-with-white color', () => {
    // #FFB74D: white-on-it is ~1.7:1 (fails WCAG AA), black-on-it is ~12:1.
    expect(pickReadableTextColor('#FFB74D')).toBe('#000000');
  });

  it('picks white text on a dark background', () => {
    expect(pickReadableTextColor('#1A1A2E')).toBe('#FFFFFF');
  });
});
