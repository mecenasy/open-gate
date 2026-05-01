import { MigrationInterface, QueryRunner } from 'typeorm';

const DEFAULT_PLATFORM_FALLBACK_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Patches the SMS master row with regulatory data needed by Twilio
 * incomingPhoneNumbers.create for PL (and any future regulated country).
 *
 * The previous master-seed migration (1778000000000) only filled the row
 * when `sid` was empty — operators who set credentials by hand kept their
 * row but missed bundleSidByCountry, and addressSidByCountry didn't exist
 * back then. This migration uses a jsonb merge (`config || $1::jsonb`) so
 * existing sid/token/phone are preserved and only the regulatory fields
 * are added/overwritten.
 *
 * Reads `TWILIO_PL_BUNDLE_SID` and `TWILIO_PL_ADDRESS_SID` from the env at
 * migration time. Empty values are skipped — the merge stays a no-op for
 * that country and a warning surfaces from the provider on purchase.
 */
export class PlatformCredentialsSmsBundleAndAddress1778100000000 implements MigrationInterface {
  name = 'PlatformCredentialsSmsBundleAndAddress1778100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const bundleSidPl = process.env.TWILIO_PL_BUNDLE_SID ?? '';
    const addressSidPl = process.env.TWILIO_PL_ADDRESS_SID ?? '';

    const bundleSidByCountry: Record<string, string> = {};
    const addressSidByCountry: Record<string, string> = {};
    if (bundleSidPl) bundleSidByCountry.PL = bundleSidPl;
    if (addressSidPl) addressSidByCountry.PL = addressSidPl;

    if (!bundleSidPl && !addressSidPl) return;

    const patch: Record<string, unknown> = { provider: 'twilio' };
    if (Object.keys(bundleSidByCountry).length > 0) patch.bundleSidByCountry = bundleSidByCountry;
    if (Object.keys(addressSidByCountry).length > 0) patch.addressSidByCountry = addressSidByCountry;

    await queryRunner.query(
      `UPDATE "shared_config"."platform_credentials"
       SET "config" = "config" || $1::jsonb
       WHERE "tenant_id" = $2 AND "platform" = 'sms'`,
      [JSON.stringify(patch), DEFAULT_PLATFORM_FALLBACK_ID],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Strip the regulatory keys we added, leaving sid/token/phone alone so
    // a rollback doesn't break SMS sending.
    await queryRunner.query(
      `UPDATE "shared_config"."platform_credentials"
       SET "config" = "config" - 'bundleSidByCountry' - 'addressSidByCountry'
       WHERE "tenant_id" = $1 AND "platform" = 'sms'`,
      [DEFAULT_PLATFORM_FALLBACK_ID],
    );
  }
}
