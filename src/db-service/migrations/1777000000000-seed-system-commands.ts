import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Seeds the initial set of system commands. PLATFORM_ADMIN can extend
 * or modify this list later via the admin UI. Tenant staff cannot edit
 * system command definitions — only toggle active/override parameters
 * through TenantCommandConfig.
 */
export class SeedSystemCommands1777000000000 implements MigrationInterface {
  name = 'SeedSystemCommands1777000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const commands: Array<{
      name: string;
      command: string;
      description: string;
      actions: Record<string, boolean>;
      parameters: Record<string, boolean>;
    }> = [
      {
        name: 'help',
        command: 'help',
        description: 'Show the list of available commands for the current user.',
        actions: { reply: true },
        parameters: {},
      },
      {
        name: 'stop',
        command: 'stop',
        description: 'Opt out of all non-transactional messages from this tenant.',
        actions: { optOut: true, reply: true },
        parameters: {},
      },
      {
        name: 'start',
        command: 'start',
        description: 'Re-subscribe to messages from this tenant after opting out.',
        actions: { optIn: true, reply: true },
        parameters: {},
      },
      {
        name: 'status',
        command: 'status',
        description: 'Show the contact’s current subscription status.',
        actions: { reply: true },
        parameters: {},
      },
    ];

    for (const c of commands) {
      await queryRunner.query(
        `INSERT INTO "commands" ("name", "command", "description", "active", "actions", "parameters", "is_system", "tenant_id")
         VALUES ($1, $2, $3, true, $4::jsonb, $5::jsonb, true, NULL)
         ON CONFLICT ("name") DO NOTHING`,
        [c.name, c.command, c.description, JSON.stringify(c.actions), JSON.stringify(c.parameters)],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "commands" WHERE "is_system" = true AND "name" IN ('help', 'stop', 'start', 'status')`,
    );
  }
}
