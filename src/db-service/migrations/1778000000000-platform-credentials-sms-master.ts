import { MigrationInterface, QueryRunner } from 'typeorm';

const DEFAULT_PLATFORM_FALLBACK_ID = '00000000-0000-0000-0000-000000000000';

const PL_REGULATORY_BUNDLE_SID = 'BUbd1df93416e3bd5b91dd0adada48f7a2';

/**
 * Seeds the global default SMS credentials row with the master Twilio
 * account used by managed-flow tenants. The row already exists from
 * 1776300000000 with config = {}; this migration fills it in with:
 *
 *   {
 *     provider:           'twilio',
 *     sid:                env TWILIO_ACCOUNT_SID    (or '' in dev),
 *     token:              env TWILIO_AUTH_TOKEN     (or '' in dev),
 *     bundleSidByCountry: { PL: 'BU...' }
 *   }
 *
 * Idempotent: only overwrites when the existing config has no `sid`. Ops
 * who set production credentials by hand keep them on re-runs.
 *
 * Per-tenant SMS rows (when a tenant brings their own Twilio account) keep
 * the legacy { sid, token, phone } shape. The new `provider` discriminator
 * is added in a follow-up commit; for now this row is forward-compatible.
 */
export class PlatformCredentialsSmsMaster1778000000000 implements MigrationInterface {
  name = 'PlatformCredentialsSmsMaster1778000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const sid = process.env.TWILIO_ACCOUNT_SID ?? '';
    const token = process.env.TWILIO_AUTH_TOKEN ?? '';
    const bundleSidByCountry = { PL: PL_REGULATORY_BUNDLE_SID };

    const config = JSON.stringify({
      provider: 'twilio',
      sid,
      token,
      bundleSidByCountry,
    });

    // Only overwrite when sid is missing in the current row, so manual ops
    // edits (real prod credentials) survive re-applying the migration.
    await queryRunner.query(
      `INSERT INTO "shared_config"."platform_credentials" ("tenant_id", "platform", "config", "is_active")
       VALUES ($1, 'sms', $2::jsonb, $3)
       ON CONFLICT ("tenant_id", "platform") DO UPDATE
         SET "config" = $2::jsonb,
             "is_active" = $3
         WHERE COALESCE("shared_config"."platform_credentials"."config"->>'sid', '') = ''`,
      [DEFAULT_PLATFORM_FALLBACK_ID, config, sid !== '' && token !== ''],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "shared_config"."platform_credentials"
       SET "config" = '{}'::jsonb, "is_active" = false
       WHERE "tenant_id" = $1 AND "platform" = 'sms'`,
      [DEFAULT_PLATFORM_FALLBACK_ID],
    );
  }
}
