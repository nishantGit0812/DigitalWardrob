import { assertValidProfileId } from '../profileId';

describe('assertValidProfileId', () => {
  it('accepts alphanumeric ids with underscores and hyphens', () => {
    expect(() => assertValidProfileId('abc123')).not.toThrow();
    expect(() => assertValidProfileId('profile_1-a')).not.toThrow();
  });

  it.each(['', '../etc/passwd', 'a/b', 'a b', 'a.b'])('rejects %p', invalid => {
    expect(() => assertValidProfileId(invalid)).toThrow('Invalid profileId');
  });
});
