import { MigrationInterface, QueryRunner } from "typeorm";

export class Message1775825677517 implements MigrationInterface {
    name = 'Message1775825677517'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "messages" ("key" character varying(255) NOT NULL, "value" text NOT NULL, CONSTRAINT "PK_c8bdc6479dc84d0717f0c649197" PRIMARY KEY ("key"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "messages"`);
    }

}
