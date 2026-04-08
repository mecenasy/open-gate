import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUser31775655720851 implements MigrationInterface {
  name = 'UpdateUser31775655720851';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_97cbed1689d2f1d944ca800b817"`);
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "authHistoriesId" TO "userRoleId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "userRoleId"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "userRoleId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_a52455e2cef06f0a3faf30f96a3" FOREIGN KEY ("userRoleId") REFERENCES "user_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a52455e2cef06f0a3faf30f96a3"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "userRoleId"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "userRoleId" integer`);
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "userRoleId" TO "authHistoriesId"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_97cbed1689d2f1d944ca800b817" FOREIGN KEY ("authHistoriesId") REFERENCES "auth_histories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
