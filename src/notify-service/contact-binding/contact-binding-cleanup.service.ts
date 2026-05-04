import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContactBindingDbClient } from './contact-binding-db.client';

/**
 * Flips contact_bindings.status pending → expired for rows whose
 * expires_at has passed. Runs every 6h — granularity is fine for a
 * 7-day TTL, and the partial index on (expires_at) WHERE status='pending'
 * keeps the scan cheap regardless of how many verified/expired rows
 * accumulate over time.
 *
 * We don't delete: keeping the row preserves audit ("who tried to bind
 * this number, when, did they reply") for ops debugging.
 */
@Injectable()
export class ContactBindingCleanupService {
  private readonly logger = new Logger(ContactBindingCleanupService.name);

  constructor(private readonly bindingClient: ContactBindingDbClient) {}

  @Cron('0 */6 * * *', { name: 'contact-binding-expire', timeZone: 'UTC' })
  async markExpired(): Promise<void> {
    try {
      const expired = await this.bindingClient.markExpiredBindings(0);
      if (expired > 0) {
        this.logger.log(`Contact bindings expired: ${expired}`);
      } else {
        this.logger.debug('Contact bindings expire: nothing to do');
      }
    } catch (err) {
      this.logger.error(`Contact bindings expire run failed: ${(err as Error).message}`);
    }
  }
}
