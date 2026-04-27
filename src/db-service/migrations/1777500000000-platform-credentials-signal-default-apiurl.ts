import { MigrationInterface, QueryRunner } from 'typeorm';

const DEFAULT_PLATFORM_FALLBACK_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Seeds the global default Signal credentials row (tenant_id = sentinel UUID)
 * with the gateway URL pulled from env. Account stays empty — the default row
 * is *only* used as a fallback gateway endpoint, not as an authenticated
 * sender. Per-tenant rows (with `account`) override this when present.
 *
 * Idempotent: only writes apiUrl when the existing config doesn't already
 * have one, so re-applying after manual edits is safe.
 */
export class PlatformCredentialsSignalDefaultApiUrl1777500000000 implements MigrationInterface {
  name = 'PlatformCredentialsSignalDefaultApiUrl1777500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const apiUrl = process.env.SIGNAL_API_URL ?? 'http://signal_bridge:8080';

    await queryRunner.query(
      `INSERT INTO "shared_config"."platform_credentials" ("tenant_id", "platform", "config", "is_active")
       VALUES ($1, 'signal', jsonb_build_object('apiUrl', $2::text, 'account', ''), false)
       ON CONFLICT ("tenant_id", "platform") DO UPDATE
         SET "config" = jsonb_set(
           COALESCE("shared_config"."platform_credentials"."config", '{}'::jsonb),
           '{apiUrl}',
           to_jsonb($2::text),
           true
         )
         WHERE COALESCE("shared_config"."platform_credentials"."config"->>'apiUrl', '') = ''`,
      [DEFAULT_PLATFORM_FALLBACK_ID, apiUrl],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "shared_config"."platform_credentials"
       SET "config" = "config" - 'apiUrl'
       WHERE "tenant_id" = $1 AND "platform" = 'signal'`,
      [DEFAULT_PLATFORM_FALLBACK_ID],
    );
  }
}
