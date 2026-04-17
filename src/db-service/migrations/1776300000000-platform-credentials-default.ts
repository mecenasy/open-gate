import { MigrationInterface, QueryRunner } from 'typeorm';

/** Sentinel UUID used as the global default for platform credentials. */
export const DEFAULT_PLATFORM_FALLBACK_ID = '00000000-0000-0000-0000-000000000000';

export class PlatformCredentialsDefault1776300000000 implements MigrationInterface {
  name = 'PlatformCredentialsDefault1776300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const smtpConfig = {
      host: process.env.SMTP_HOST ?? '',
      port: parseInt(process.env.SMTP_PORT ?? '465'),
      user: process.env.SMTP_USER ?? '',
      password: process.env.SMTP_PASSWORD ?? '',
      from: process.env.SMTP_FROM ?? '',
    };

    await queryRunner.query(
      `INSERT INTO "shared_config"."platform_credentials" ("tenant_id", "platform", "config", "is_active")
       VALUES ($1, 'smtp', $2::jsonb, $3)
       ON CONFLICT ("tenant_id", "platform") DO NOTHING`,
      [DEFAULT_PLATFORM_FALLBACK_ID, JSON.stringify(smtpConfig), !!smtpConfig.host],
    );

    for (const platform of ['sms', 'signal', 'whatsapp', 'messenger']) {
      await queryRunner.query(
        `INSERT INTO "shared_config"."platform_credentials" ("tenant_id", "platform", "config", "is_active")
         VALUES ($1, $2, '{}', false)
         ON CONFLICT ("tenant_id", "platform") DO NOTHING`,
        [DEFAULT_PLATFORM_FALLBACK_ID, platform],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "shared_config"."platform_credentials" WHERE "tenant_id" = $1`, [
      DEFAULT_PLATFORM_FALLBACK_ID,
    ]);
  }
}
