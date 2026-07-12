import { appMetaStorage } from '../../../../shared/storage/mmkv';
import { getProfileRegistry } from '../../../../shared/storage';
import { LocalProfileRepository } from '../profileRepository';

const mockProvisionProfileStorage = jest.fn();

jest.mock('../profileStorageProvisioning', () => ({
  __esModule: true,
  provisionProfileStorage: (...args: unknown[]) =>
    mockProvisionProfileStorage(...args),
}));

beforeEach(() => {
  appMetaStorage.clearAll();
  mockProvisionProfileStorage.mockReset().mockResolvedValue(undefined);
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
});
