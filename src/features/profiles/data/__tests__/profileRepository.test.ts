import {
  getActiveProfileId,
  getProfileRegistry,
  setActiveProfileId,
} from '../../../../shared/storage';
import { appMetaStorage } from '../../../../shared/storage/mmkv';
import { LocalProfileRepository } from '../profileRepository';

const mockProvisionProfileStorage = jest.fn();
const mockDeprovisionProfileStorage = jest.fn();

jest.mock('../profileStorageProvisioning', () => ({
  __esModule: true,
  provisionProfileStorage: (...args: unknown[]) =>
    mockProvisionProfileStorage(...args),
  deprovisionProfileStorage: (...args: unknown[]) =>
    mockDeprovisionProfileStorage(...args),
}));

beforeEach(() => {
  appMetaStorage.clearAll();
  mockProvisionProfileStorage.mockReset().mockResolvedValue(undefined);
  mockDeprovisionProfileStorage.mockReset().mockResolvedValue(undefined);
});

describe('LocalProfileRepository.list', () => {
  it('is empty by default', async () => {
    await expect(new LocalProfileRepository().list()).resolves.toEqual([]);
  });

  it('returns profiles oldest-first regardless of registry order', async () => {
    const repo = new LocalProfileRepository();
    const first = await repo.create('Priya', '#E57373');
    const second = await repo.create('Devraj', '#4FC3F7');

    const listed = await repo.list();

    expect(listed.map(p => p.id)).toEqual([first.id, second.id]);
  });

  it('does not expose createdAt on the Domain-facing Profile', async () => {
    const repo = new LocalProfileRepository();
    const created = await repo.create('Priya', '#E57373');

    expect(created).toEqual({
      id: created.id,
      name: 'Priya',
      avatarColor: '#E57373',
    });
  });
});

describe('LocalProfileRepository.create', () => {
  it('provisions storage before writing the registry entry', async () => {
    const callOrder: string[] = [];
    mockProvisionProfileStorage.mockImplementation(async () => {
      callOrder.push('provision');
    });

    const repo = new LocalProfileRepository();
    await repo.create('Priya', '#E57373');
    callOrder.push(
      getProfileRegistry().length === 1 ? 'registry-written' : 'unexpected',
    );

    expect(callOrder).toEqual(['provision', 'registry-written']);
  });

  it('never writes a registry entry if provisioning fails', async () => {
    mockProvisionProfileStorage.mockRejectedValue(new Error('disk full'));

    await expect(
      new LocalProfileRepository().create('Priya', '#E57373'),
    ).rejects.toThrow('disk full');
    expect(getProfileRegistry()).toEqual([]);
  });

  it('rejects an empty or whitespace-only name', async () => {
    const repo = new LocalProfileRepository();

    await expect(repo.create('', '#E57373')).rejects.toThrow(
      'Profile name is required.',
    );
    await expect(repo.create('   ', '#E57373')).rejects.toThrow(
      'Profile name is required.',
    );
    expect(mockProvisionProfileStorage).not.toHaveBeenCalled();
  });

  it('trims the name before storing it', async () => {
    const created = await new LocalProfileRepository().create(
      '  Priya  ',
      '#E57373',
    );

    expect(created.name).toBe('Priya');
  });

  it('rejects a 5th profile once 4 already exist', async () => {
    const repo = new LocalProfileRepository();
    await repo.create('P1', '#E57373');
    await repo.create('P2', '#F06292');
    await repo.create('P3', '#BA68C8');
    await repo.create('P4', '#7986CB');

    await expect(repo.create('P5', '#4FC3F7')).rejects.toThrow(
      'Cannot create more than 4 profiles.',
    );
    expect(getProfileRegistry()).toHaveLength(4);
  });

  it('serializes concurrent creates so neither write is lost', async () => {
    const repo = new LocalProfileRepository();

    // Fired without awaiting the first — both read-check-write cycles start
    // before either has written, which is exactly the interleaving that
    // would silently drop one entry without the repository's mutation
    // queue serializing them.
    const [first, second] = await Promise.all([
      repo.create('Priya', '#E57373'),
      repo.create('Devraj', '#4FC3F7'),
    ]);

    expect(first.id).not.toBe(second.id);
    expect(getProfileRegistry()).toHaveLength(2);
    expect(
      getProfileRegistry()
        .map(entry => entry.id)
        .sort(),
    ).toEqual([first.id, second.id].sort());
  });
});

describe('LocalProfileRepository.update', () => {
  it('renames and re-colors an existing profile in place', async () => {
    const repo = new LocalProfileRepository();
    const created = await repo.create('Priya', '#E57373');

    const updated = await repo.update(created.id, 'Priya S.', '#4FC3F7');

    expect(updated).toEqual({
      id: created.id,
      name: 'Priya S.',
      avatarColor: '#4FC3F7',
    });
    expect(await repo.list()).toEqual([updated]);
  });

  it('preserves createdAt so the grid order is unaffected by an edit', async () => {
    const repo = new LocalProfileRepository();
    const first = await repo.create('Priya', '#E57373');
    const second = await repo.create('Devraj', '#4FC3F7');

    await repo.update(first.id, 'Priya S.', '#F06292');

    expect((await repo.list()).map(p => p.id)).toEqual([first.id, second.id]);
  });

  it('rejects an empty or whitespace-only name', async () => {
    const repo = new LocalProfileRepository();
    const created = await repo.create('Priya', '#E57373');

    await expect(repo.update(created.id, '', '#4FC3F7')).rejects.toThrow(
      'Profile name is required.',
    );
    await expect(repo.update(created.id, '   ', '#4FC3F7')).rejects.toThrow(
      'Profile name is required.',
    );
  });

  it('rejects an unknown profileId', async () => {
    await expect(
      new LocalProfileRepository().update('missing', 'Name', '#E57373'),
    ).rejects.toThrow('Profile missing does not exist.');
  });
});

describe('LocalProfileRepository.remove', () => {
  it('deprovisions storage and removes the registry entry', async () => {
    const repo = new LocalProfileRepository();
    const created = await repo.create('Priya', '#E57373');

    await repo.remove(created.id);

    expect(mockDeprovisionProfileStorage).toHaveBeenCalledWith(
      created.id,
      undefined,
      undefined,
    );
    expect(getProfileRegistry()).toEqual([]);
  });

  it('deprovisions storage before removing the registry entry', async () => {
    const callOrder: string[] = [];
    mockDeprovisionProfileStorage.mockImplementation(async () => {
      callOrder.push('deprovision');
    });

    const repo = new LocalProfileRepository();
    const created = await repo.create('Priya', '#E57373');
    await repo.remove(created.id);
    callOrder.push(
      getProfileRegistry().length === 0 ? 'registry-removed' : 'unexpected',
    );

    expect(callOrder).toEqual(['deprovision', 'registry-removed']);
  });

  it('leaves other profiles untouched', async () => {
    const repo = new LocalProfileRepository();
    const first = await repo.create('Priya', '#E57373');
    const second = await repo.create('Devraj', '#4FC3F7');

    await repo.remove(first.id);

    expect(await repo.list()).toEqual([second]);
  });

  it('clears activeProfileId if it pointed at the deleted profile', async () => {
    const repo = new LocalProfileRepository();
    const created = await repo.create('Priya', '#E57373');
    setActiveProfileId(created.id);

    await repo.remove(created.id);

    expect(getActiveProfileId()).toBeUndefined();
  });

  it('leaves activeProfileId untouched if it points at a different profile', async () => {
    const repo = new LocalProfileRepository();
    const first = await repo.create('Priya', '#E57373');
    const second = await repo.create('Devraj', '#4FC3F7');
    setActiveProfileId(second.id);

    await repo.remove(first.id);

    expect(getActiveProfileId()).toBe(second.id);
  });

  it('is idempotent for an already-removed or unknown profileId', async () => {
    await expect(
      new LocalProfileRepository().remove('never-existed'),
    ).resolves.toBeUndefined();
    expect(mockDeprovisionProfileStorage).not.toHaveBeenCalled();
  });
});
