import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PhoneProcurementProvider } from '../phone-procurement.provider';
import type {
  AvailableNumber,
  ListAvailableOptions,
  PurchaseOptions,
  PurchaseResult,
  ReleaseResult,
} from '../../phone-procurement.types';

/** One real test number + nine fakes — see SHARED_REAL_TEST_NUMBER below. */
const SHARED_REAL_TEST_NUMBER = '+48732144653';

/**
 * Sandbox provider — activated by TWILIO_SANDBOX=true. Produces a stable
 * pool of fake-looking PL mobile numbers plus one shared real test number
 * (the operator's own Twilio sandbox line, +1 561 349 4418), so SMS
 * actually delivered through this provider use a verified line.
 *
 * Every call is local — no Twilio API contact, no charges. `purchase`
 * mints a new mock-* external_id per call so multiple sandbox tenants
 * each "own" their own row even though several may share the physical
 * test number.
 */
@Injectable()
export class MockProcurementProvider extends PhoneProcurementProvider {
  readonly providerKey = 'mock';
  private readonly logger = new Logger(MockProcurementProvider.name);

  async listAvailable(opts: ListAvailableOptions): Promise<AvailableNumber[]> {
    const limit = opts.limit ?? 10;
    const country = opts.country.toUpperCase();
    const fakeNumbers = generateFakePool(country).slice(0, Math.max(0, limit - 1));
    const real: AvailableNumber = {
      phoneE164: SHARED_REAL_TEST_NUMBER,
      capabilities: { sms: true, mms: true, voice: true },
      region: 'Florida',
      locality: 'Boca Raton',
    };
    return [real, ...fakeNumbers];
  }

  async purchase(opts: PurchaseOptions): Promise<PurchaseResult> {
    this.logger.log(`Mock purchase of ${opts.phoneE164} (no Twilio call).`);
    return {
      externalId: `mock-${randomUUID()}`,
      phoneE164: opts.phoneE164,
      capabilities: { sms: true, mms: true, voice: true },
    };
  }

  async release(externalId: string): Promise<ReleaseResult> {
    this.logger.log(`Mock release of ${externalId} (no-op).`);
    return { externalId, released: true };
  }

  // No countMessagesForRange — mock has no real send history. The cron
  // therefore skips mock-provisioned rows.
}

function generateFakePool(country: string): AvailableNumber[] {
  // Static seeds so the list looks the same on every load (good UX —
  // the user can pick "the third one" reliably).

  const prefix = country === 'PL' ? '+4873' : '+1555';
  const seeds = ['2144653', '2345678', '3456789', '4567890', '5678901', '6789012', '7890123', '8901234', '9012345'];
  return seeds.map((tail) => ({
    phoneE164: `${prefix}${tail}`,
    capabilities: { sms: true, mms: false, voice: false },
    region: country === 'PL' ? 'Mazowieckie' : 'California',
    locality: country === 'PL' ? 'Warszawa' : 'San Francisco',
  }));
}
