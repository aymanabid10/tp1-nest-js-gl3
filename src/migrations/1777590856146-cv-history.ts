import { MigrationInterface, QueryRunner } from 'typeorm';

export class CvHistory1777590856146 implements MigrationInterface {
  name = 'CvHistory1777590856146';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."cv_history_event_type_enum" AS ENUM('CREATE_STARTED', 'CREATED', 'READ', 'UPDATE_STARTED', 'UPDATED', 'DELETE_STARTED', 'DELETED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "cv_history" ("id" SERIAL NOT NULL, "event_type" "public"."cv_history_event_type_enum" NOT NULL, "authorId" integer NOT NULL, "target_owner_id" integer NOT NULL, "cvId" integer, "payload" jsonb, "performedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6c57bc735391d7e7a75350483cd" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "cv_history"`);
    await queryRunner.query(`DROP TYPE "public"."cv_history_event_type_enum"`);
  }
}
