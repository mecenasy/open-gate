jest.mock('uuid', () => ({ v4: jest.fn() }));

import { v4 as uuid } from 'uuid';
import type { CacheService } from '@app/redis';
import type { OnboardingSession } from './onboarding.types';
import { OnboardingSessionStore } from './onboarding-session.store';

const uuidMock = uuid as jest.MockedFunction<typeof uuid>;

describe('OnboardingSessionStore', () => {
  let cache: jest.Mocked<CacheService>;
  let store: OnboardingSessionStore;

  beforeEach(() => {
    cache = {
      getFromCache: jest.fn(),
      saveInCache: jest.fn().mockResolvedValue(undefined),
      removeFromCache: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<CacheService>;
    store = new OnboardingSessionStore(cache);
    uuidMock.mockReturnValue('sess-uuid-1');
    jest
      .spyOn((store as unknown as { logger: { warn: jest.Mock } }).logger, 'warn')
      .mockImplementation(() => undefined);
  });

  describe('create', () => {
    it('persists a fresh session with sessionId/uuid, expectedStepKey="start" and timestamps', async () => {
      const before = new Date().toISOString();

      const session = await store.create({ tenantId: 't-1', platform: 'signal', params: { x: 1 } });

      expect(session).toMatchObject({
        sessionId: 'sess-uuid-1',
        tenantId: 't-1',
        platform: 'signal',
        params: { x: 1 },
        meta: {},
        expectedStepKey: 'start',
      });
      expect(session.createdAt).toEqual(session.updatedAt);
      expect(session.createdAt >= before).toBe(true);

      expect(cache.saveInCache).toHaveBeenCalledWith({
        identifier: 'sess-uuid-1',
        prefix: 'platform-onboarding',
        data: session,
        EX: 15 * 60,
      });
    });

    it('persists without tenantId (wizard flow)', async () => {
      const session = await store.create({ platform: 'signal', params: {} });
      expect(session.tenantId).toBeUndefined();
    });
  });

  describe('get', () => {
    it('returns the session payload from cache', async () => {
      const session: OnboardingSession = {
        sessionId: 's-1',
        platform: 'signal',
        params: {},
        meta: {},
        expectedStepKey: 'captcha_token',
        createdAt: '2026-05-04T10:00:00Z',
        updatedAt: '2026-05-04T10:01:00Z',
      };
      cache.getFromCache.mockResolvedValue(session);

      expect(await store.get('s-1')).toEqual(session);
      expect(cache.getFromCache).toHaveBeenCalledWith({ identifier: 's-1', prefix: 'platform-onboarding' });
    });

    it('returns null when redis is unreachable (does not throw)', async () => {
      cache.getFromCache.mockRejectedValue(new Error('redis down'));
      expect(await store.get('s-1')).toBeNull();

      const warn = (store as unknown as { logger: { warn: jest.Mock } }).logger.warn;
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('redis down'));
    });

    it('returns null when nothing cached', async () => {
      cache.getFromCache.mockResolvedValue(null);
      expect(await store.get('s-2')).toBeNull();
    });
  });

  describe('update', () => {
    it('refreshes updatedAt and re-persists with the same TTL', async () => {
      const session: OnboardingSession = {
        sessionId: 's-1',
        platform: 'signal',
        params: {},
        meta: {},
        expectedStepKey: 'captcha_token',
        createdAt: '2026-05-04T10:00:00Z',
        updatedAt: '2026-05-04T10:00:00Z',
      };

      await store.update(session);

      expect(session.updatedAt).not.toBe('2026-05-04T10:00:00Z');
      expect(cache.saveInCache).toHaveBeenCalledWith({
        identifier: 's-1',
        prefix: 'platform-onboarding',
        data: session,
        EX: 15 * 60,
      });
    });
  });

  describe('remove', () => {
    it('drops the session from cache', async () => {
      await store.remove('s-1');
      expect(cache.removeFromCache).toHaveBeenCalledWith({ identifier: 's-1', prefix: 'platform-onboarding' });
    });

    it('logs and swallows redis errors (best-effort cleanup)', async () => {
      cache.removeFromCache.mockRejectedValue(new Error('redis flap'));

      await expect(store.remove('s-1')).resolves.toBeUndefined();
      const warn = (store as unknown as { logger: { warn: jest.Mock } }).logger.warn;
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('redis flap'));
    });
  });
});
