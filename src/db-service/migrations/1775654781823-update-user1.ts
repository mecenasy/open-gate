import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUser11775654781823 implements MigrationInterface {
  name = 'UpdateUser11775654781823';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a52455e2cef06f0a3faf30f96a3"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "REL_a52455e2cef06f0a3faf30f96a"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "userRoleId"`);
    await queryRunner.query(`ALTER TABLE "user_roles" ADD "userId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_472b25323af01488f1f66a06b67"`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "userRoleId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "REL_a52455e2cef06f0a3faf30f96a" UNIQUE ("userRoleId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_a52455e2cef06f0a3faf30f96a3" FOREIGN KEY ("userRoleId") REFERENCES "user_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
