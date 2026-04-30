import { MigrationInterface, QueryRunner } from "typeorm";

export class CvHistory1777590856146 implements MigrationInterface {
    name = 'CvHistory1777590856146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "skill" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" SERIAL NOT NULL, "designation" character varying NOT NULL, CONSTRAINT "PK_a0d33334424e64fb78dc3ce7196" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cv" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" SERIAL NOT NULL, "name" character varying NOT NULL, "firstname" character varying NOT NULL, "age" integer NOT NULL, "cin" character varying NOT NULL, "job" character varying NOT NULL, "path" character varying, "userId" integer, CONSTRAINT "PK_4ddf7891daf83c3506efa503bb8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`CREATE TABLE "user" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "salt" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."cv_history_operationtype_enum" AS ENUM('0', '1', '2')`);
        await queryRunner.query(`CREATE TYPE "public"."cv_history_operationphase_enum" AS ENUM('0', '1')`);
        await queryRunner.query(`CREATE TABLE "cv_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "operationType" "public"."cv_history_operationtype_enum" NOT NULL, "operationPhase" "public"."cv_history_operationphase_enum" NOT NULL, "authorId" integer NOT NULL, "cvId" integer, "payload" jsonb, "performedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6c57bc735391d7e7a75350483cd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cv_skills_skill" ("cvId" integer NOT NULL, "skillId" integer NOT NULL, CONSTRAINT "PK_69e9504416ac293292c18fbf638" PRIMARY KEY ("cvId", "skillId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5adf1336ce64eb1b5e0ed23bea" ON "cv_skills_skill" ("cvId") `);
        await queryRunner.query(`CREATE INDEX "IDX_078a4872121f8b4f6e66522170" ON "cv_skills_skill" ("skillId") `);
        await queryRunner.query(`ALTER TABLE "cv" ADD CONSTRAINT "FK_e4b7330e64fd0ecce86720e62f9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cv_skills_skill" ADD CONSTRAINT "FK_5adf1336ce64eb1b5e0ed23bea6" FOREIGN KEY ("cvId") REFERENCES "cv"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "cv_skills_skill" ADD CONSTRAINT "FK_078a4872121f8b4f6e665221706" FOREIGN KEY ("skillId") REFERENCES "skill"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cv_skills_skill" DROP CONSTRAINT "FK_078a4872121f8b4f6e665221706"`);
        await queryRunner.query(`ALTER TABLE "cv_skills_skill" DROP CONSTRAINT "FK_5adf1336ce64eb1b5e0ed23bea6"`);
        await queryRunner.query(`ALTER TABLE "cv" DROP CONSTRAINT "FK_e4b7330e64fd0ecce86720e62f9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_078a4872121f8b4f6e66522170"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5adf1336ce64eb1b5e0ed23bea"`);
        await queryRunner.query(`DROP TABLE "cv_skills_skill"`);
        await queryRunner.query(`DROP TABLE "cv_history"`);
        await queryRunner.query(`DROP TYPE "public"."cv_history_operationphase_enum"`);
        await queryRunner.query(`DROP TYPE "public"."cv_history_operationtype_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "cv"`);
        await queryRunner.query(`DROP TABLE "skill"`);
    }

}
