import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PhoneProcurementProvider } from './providers/phone-procurement.provider';
import type {
  AvailableNumber,
  CountMessagesOptions,
  ListAvailableOptions,
  PurchaseOptions,
  PurchaseResult,
  ReleaseResult,
} from './phone-procurement.types';

export const PHONE_PROCUREMENT_PROVIDERS = Symbol('PHONE_PROCUREMENT_PROVIDERS');

/**
 * Facade in front of the provider registry. The wizard / cron jobs talk to
 * this service and never to a provider directly. Two routing modes:
 *
 *   - Active provider (listAvailable / purchase / isSandbox) — picked once
 *     at startup based on env. `release` for the active one too, since the
 *     wizard only ever buys via active.
 *   - Lookup by key (releaseFromProvider / countMessagesForRange) — used by
 *     crons that operate on existing rows whose `provider_key` may pre-date
 *     a provider switch (e.g. a tenant bought via 'twilio' last quarter
 *     and now we're in sandbox; release still has to go to twilio).
 *
 * The active provider is wired by reading TWILIO_SANDBOX in a follow-up
 * commit. For now the registry simply exposes whatever providers were
 * registered; lookup-mode methods work regardless.
 */
@Injectable()
export class PhoneProcurementService {
  private readonly logger = new Logger(PhoneProcurementService.name);
  private readonly providers = new Map<string, PhoneProcurementProvider>();
  private readonly activeProviderKey: string;

  constructor(
    @Inject(PHONE_PROCUREMENT_PROVIDERS) providers: PhoneProcurementProvider[],
    private readonly configService: ConfigService,
  ) {
    for (const p of providers) {
      if (this.providers.has(p.providerKey)) {
        throw new Error(`Duplicate phone procurement provider key="${p.providerKey}"`);
      }
      this.providers.set(p.providerKey, p);
    }
    this.activeProviderKey = this.pickActiveProvider();
    this.logger.log(`Active phone procurement provider: ${this.activeProviderKey}`);
  }

  isSandbox(): boolean {
    return this.activeProviderKey === 'mock';
  }

  getActiveProviderKey(): string {
    return this.activeProviderKey;
  }

  listAvailable(opts: ListAvailableOptions): Promise<AvailableNumber[]> {
    return this.requireActive().listAvailable(opts);
  }

  purchase(opts: PurchaseOptions): Promise<PurchaseResult> {
    return this.requireActive().purchase(opts);
  }

  release(externalId: string): Promise<ReleaseResult> {
    return this.requireActive().release(externalId);
  }

  /**
   * Release a number through whichever provider originally owns it. Used
   * by the unattached-purchases cleanup cron, which sees rows with their
   * own provider_key.
   */
  releaseFromProvider(providerKey: string, externalId: string): Promise<ReleaseResult> {
    return this.requireProvider(providerKey).release(externalId);
  }

  /**
   * Returns null when the provider doesn't expose a usage source
   * (notably the mock sandbox).
   */
  async countMessagesForRange(providerKey: string, opts: CountMessagesOptions): Promise<number | null> {
    const provider = this.requireProvider(providerKey);
    if (!provider.countMessagesForRange) return null;
    return provider.countMessagesForRange(opts);
  }

  /**
   * Resolution:
   *   1. TWILIO_SANDBOX=true AND 'mock' is registered → 'mock'.
   *   2. Else 'twilio' if registered.
   *   3. Else first registered provider — defensive default if a future
   *      provider is added but registry wiring hasn't been updated.
   *
   * TWILIO_SANDBOX is intentionally independent of NODE_ENV: ops can flip
   * it on in staging for end-to-end demos without touching the deploy
   * mode, or leave it off in dev when working against real Twilio.
   */
  private pickActiveProvider(): string {
    const sandbox = this.configService.get<boolean>('TWILIO_SANDBOX') === true;
    if (sandbox && this.providers.has('mock')) return 'mock';
    if (this.providers.has('twilio')) return 'twilio';
    const first = this.providers.keys().next().value;
    if (!first) {
      return 'twilio';
    }
    return first;
  }

  private requireActive(): PhoneProcurementProvider {
    return this.requireProvider(this.activeProviderKey);
  }

  private requireProvider(providerKey: string): PhoneProcurementProvider {
    const p = this.providers.get(providerKey);
    if (!p) {
      throw new Error(`No phone procurement provider registered for key="${providerKey}"`);
    }
    return p;
  }
}
