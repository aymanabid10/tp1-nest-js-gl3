import { MigrationInterface, QueryRunner } from 'typeorm';

export class CvHistory1777590856146 implements MigrationInterface {
  name = 'CvHistory1777590856146';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."cv_history_operationtype_enum" AS ENUM('0', '1', '2')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cv_history_operationphase_enum" AS ENUM('0', '1')`,
    );
    await queryRunner.query(
      `CREATE TABLE "cv_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "operationType" "public"."cv_history_operationtype_enum" NOT NULL, "operationPhase" "public"."cv_history_operationphase_enum" NOT NULL, "authorId" integer NOT NULL, "cvId" integer, "payload" jsonb, "performedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6c57bc735391d7e7a75350483cd" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "cv_history"`);
    await queryRunner.query(
      `DROP TYPE "public"."cv_history_operationphase_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."cv_history_operationtype_enum"`,
    );
  }
}
