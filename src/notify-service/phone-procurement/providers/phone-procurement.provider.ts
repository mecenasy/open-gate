import type {
  AvailableNumber,
  CountMessagesOptions,
  ListAvailableOptions,
  PurchaseOptions,
  PurchaseResult,
  ReleaseResult,
} from '../phone-procurement.types';

/**
 * One implementation per phone-number operator. Registered in the module
 * under the PHONE_PROCUREMENT_PROVIDERS multi-provider token; the facade
 * picks the active one based on env (TWILIO_SANDBOX selects 'mock').
 */
export abstract class PhoneProcurementProvider {
  /** Stable identifier — stored on every purchased number row. */
  abstract readonly providerKey: string;

  abstract listAvailable(opts: ListAvailableOptions): Promise<AvailableNumber[]>;

  abstract purchase(opts: PurchaseOptions): Promise<PurchaseResult>;

  abstract release(externalId: string): Promise<ReleaseResult>;

  /**
   * Optional usage-counter source. Implementations that can ask the
   * upstream operator for "how many messages did this number send between
   * X and Y" return a count here; ones that can't (mock) leave it
   * undefined and the daily-sync cron will skip them.
   */
  countMessagesForRange?(opts: CountMessagesOptions): Promise<number>;
}
