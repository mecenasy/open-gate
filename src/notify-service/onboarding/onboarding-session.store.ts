import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { CacheService } from '@app/redis';
import type { OnboardingSession } from './onboarding.types';

const CACHE_PREFIX = 'platform-onboarding';
const TTL_SECONDS = 15 * 60;

/**
 * Redis-backed store for in-flight onboarding sessions. Sessions are
 * intentionally short-lived (15 min TTL) — the user is expected to
 * complete the flow in one sitting; orphaned sessions just expire.
 *
 * Keyed by sessionId (UUID). tenantId is *not* the key: a wizard creates
 * sessions before the tenant exists, and we still want a stable handle
 * across requests.
 */
@Injectable()
export class OnboardingSessionStore {
  private readonly logger = new Logger(OnboardingSessionStore.name);

  constructor(private readonly cache: CacheService) {}

  async create(input: {
    tenantId?: string;
    platform: string;
    params: Record<string, unknown>;
  }): Promise<OnboardingSession> {
    const now = new Date().toISOString();
    const session: OnboardingSession = {
      sessionId: uuid(),
      tenantId: input.tenantId,
      platform: input.platform,
      params: input.params,
      meta: {},
      expectedStepKey: 'start',
      createdAt: now,
      updatedAt: now,
    };
    await this.persist(session);
    return session;
  }

  async get(sessionId: string): Promise<OnboardingSession | null> {
    try {
      return await this.cache.getFromCache<OnboardingSession>({
        identifier: sessionId,
        prefix: CACHE_PREFIX,
      });
    } catch (err) {
      this.logger.warn(`Redis read failed for onboarding session ${sessionId}: ${String(err)}`);
      return null;
    }
  }

  async update(session: OnboardingSession): Promise<void> {
    session.updatedAt = new Date().toISOString();
    await this.persist(session);
  }

  async remove(sessionId: string): Promise<void> {
    try {
      await this.cache.removeFromCache({ identifier: sessionId, prefix: CACHE_PREFIX });
    } catch (err) {
      this.logger.warn(`Redis delete failed for onboarding session ${sessionId}: ${String(err)}`);
    }
  }

  private async persist(session: OnboardingSession): Promise<void> {
    await this.cache.saveInCache({
      identifier: session.sessionId,
      prefix: CACHE_PREFIX,
      data: session,
      EX: TTL_SECONDS,
    });
  }
}
