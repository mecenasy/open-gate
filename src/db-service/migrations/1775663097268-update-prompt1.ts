import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePrompt11775663097268 implements MigrationInterface {
  name = 'UpdatePrompt11775663097268';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prompts" ADD "commandName" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prompts" DROP COLUMN "commandName"`);
  }
}
