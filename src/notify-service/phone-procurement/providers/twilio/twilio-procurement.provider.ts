import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';
import {
  DEFAULT_PLATFORM_FALLBACK_ID,
  PlatformConfigService,
  type SmsCredentials,
} from '../../../platform-config/platform-config.service';
import { PhoneProcurementProvider } from '../phone-procurement.provider';
import { normalizeCapabilities } from '../../phone-procurement.types';
import type {
  AvailableNumber,
  CountMessagesOptions,
  ListAvailableOptions,
  PurchaseOptions,
  PurchaseResult,
  ReleaseResult,
} from '../../phone-procurement.types';

interface CachedClient {
  sid: string;
  client: Twilio;
}

/**
 * Twilio-backed implementation. All calls run against the master account
 * stored at DEFAULT_PLATFORM_FALLBACK_ID — even for tenants on self-hosted
 * Twilio plans the procurement provider only ever buys via our master.
 *
 * The client is cached by sid; if ops rotates the master account creds the
 * cache is rebuilt on the next call (sid mismatch invalidates).
 */
@Injectable()
export class TwilioProcurementProvider extends PhoneProcurementProvider {
  readonly providerKey = 'twilio';
  private readonly logger = new Logger(TwilioProcurementProvider.name);
  private cached: CachedClient | null = null;

  constructor(private readonly platformConfig: PlatformConfigService) {
    super();
  }

  async listAvailable(opts: ListAvailableOptions): Promise<AvailableNumber[]> {
    const client = await this.getClient();
    const country = client.availablePhoneNumbers(opts.country);
    const limit = opts.limit ?? 10;
    const type = opts.type ?? 'mobile';

    const list =
      type === 'local'
        ? await country.local.list({ limit })
        : type === 'tollfree'
          ? await country.tollFree.list({ limit })
          : await country.mobile.list({ limit });

    return list.map((n) => ({
      phoneE164: n.phoneNumber,
      capabilities: normalizeCapabilities(n.capabilities),
      region: n.region || undefined,
      locality: n.locality || undefined,
    }));
  }

  async purchase(opts: PurchaseOptions): Promise<PurchaseResult> {
    console.log('🚀 ~ TwilioProcurementProvider ~ purchase ~ opts:', opts);
    console.log('🚀 ~ TwilioProcurementProvider ~ purchase ~ opts:', opts);
    const { client, master } = await this.getClientWithMaster();
    console.log('🚀 ~ TwilioProcurementProvider ~ purchase ~ master:', master);
    const bundleSid = master.bundleSidByCountry?.[opts.country];
    const addressSid = master.addressSidByCountry?.[opts.country];
    if (!bundleSid) {
      this.logger.warn(`No regulatory bundle for country=${opts.country}; purchase will rely on Twilio defaults.`);
    }
    if (!addressSid) {
      this.logger.warn(
        `No address SID for country=${opts.country}; Twilio will reject the purchase if the country requires one (e.g. PL).`,
      );
    }

    const created = await client.incomingPhoneNumbers.create({
      phoneNumber: opts.phoneE164,
      ...(bundleSid ? { bundleSid } : {}),
      ...(addressSid ? { addressSid } : {}),
      ...(opts.webhookSmsUrl ? { smsUrl: opts.webhookSmsUrl } : {}),
      ...(opts.webhookVoiceUrl ? { voiceUrl: opts.webhookVoiceUrl } : {}),
    });

    return {
      externalId: created.sid,
      phoneE164: created.phoneNumber,
      capabilities: normalizeCapabilities(created.capabilities),
    };
  }

  async release(externalId: string): Promise<ReleaseResult> {
    const client = await this.getClient();
    await client.incomingPhoneNumbers(externalId).remove();
    return { externalId, released: true };
  }

  async countMessagesForRange(opts: CountMessagesOptions): Promise<number> {
    const client = await this.getClient();
    // Twilio paginates server-side; .list({ limit }) auto-paginates up to
    // limit. We use a generous cap because counts of >5k/day per number
    // are unrealistic for our managed flow.
    const messages = await client.messages.list({
      from: opts.phoneE164,
      dateSentAfter: opts.fromUtc,
      dateSentBefore: opts.toUtc,
      limit: 5000,
    });
    return messages.length;
  }

  private async getClient(): Promise<Twilio> {
    return (await this.getClientWithMaster()).client;
  }

  private async getClientWithMaster(): Promise<{ client: Twilio; master: SmsCredentials }> {
    const master = await this.platformConfig.getConfig(DEFAULT_PLATFORM_FALLBACK_ID, 'sms');
    console.log('🚀 ~ TwilioProcurementProvider ~ getClientWithMaster ~ master:', master);
    if (!master?.sid || !master.token) {
      throw new Error('Twilio procurement provider: master SMS credentials missing on default row.');
    }
    if (this.cached?.sid !== master.sid) {
      this.cached = { sid: master.sid, client: new Twilio(master.sid, master.token) };
    }
    return { client: this.cached.client, master };
  }
}
