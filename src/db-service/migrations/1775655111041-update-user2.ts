import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUser21775655111041 implements MigrationInterface {
  name = 'UpdateUser21775655111041';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_472b25323af01488f1f66a06b67"`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "authHistoriesId" integer`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_97cbed1689d2f1d944ca800b817" FOREIGN KEY ("authHistoriesId") REFERENCES "auth_histories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_97cbed1689d2f1d944ca800b817"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "authHistoriesId"`);
    await queryRunner.query(`ALTER TABLE "user_roles" ADD "userId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
