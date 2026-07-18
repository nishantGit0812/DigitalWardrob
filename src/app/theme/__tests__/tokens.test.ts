import { tokens } from '../tokens';

describe('tokens', () => {
  const categoryNames = Object.keys(tokens);

  it('has no duplicate category keys', () => {
    expect(new Set(categoryNames).size).toBe(categoryNames.length);
  });

  it.each(categoryNames)(
    'category "%s" exports at least one constant',
    name => {
      const category = tokens[name as keyof typeof tokens];
      expect(typeof category).toBe('object');
      expect(category).not.toBeNull();
      expect(Object.keys(category as object).length).toBeGreaterThan(0);
    },
  );

  it('has no duplicate keys within any single category', () => {
    categoryNames.forEach(name => {
      const keys = Object.keys(tokens[name as keyof typeof tokens] as object);
      expect(new Set(keys).size).toBe(keys.length);
    });
  });
});
