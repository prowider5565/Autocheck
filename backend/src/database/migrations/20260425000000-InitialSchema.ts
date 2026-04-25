import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema20260425000000 implements MigrationInterface {
  name = 'InitialSchema20260425000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'student', 'teacher')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."users_evaluation_mode_enum" AS ENUM('ai_automated', 'partial_assisted', 'manual')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."assignment_source_type_enum" AS ENUM('text', 'image', 'txt_file')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."assignment_status_enum" AS ENUM('processing', 'review_pending', 'graded')
    `);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "full_name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "role" "public"."users_role_enum" NOT NULL,
        "evaluation_mode" "public"."users_evaluation_mode_enum" NOT NULL DEFAULT 'ai_automated',
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "course" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "title" character varying(120) NOT NULL,
        "description" text,
        "teacher_id" integer NOT NULL,
        "is_archived" boolean NOT NULL DEFAULT false,
        "archived_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_course_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "homework" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "course_id" integer NOT NULL,
        "description" text NOT NULL,
        CONSTRAINT "PK_homework_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "assignment" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "homework_id" integer NOT NULL,
        "student_id" integer NOT NULL,
        "attempt_number" integer NOT NULL,
        "source_type" "public"."assignment_source_type_enum" NOT NULL,
        "original_text" text,
        "extracted_text" text NOT NULL,
        "file_path" text,
        "file_name" text,
        "status" "public"."assignment_status_enum" NOT NULL DEFAULT 'processing',
        "gemini_score" double precision,
        "gemini_feedback" text,
        "final_score" double precision,
        "final_feedback" text,
        "teacher_edited" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_assignment_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "course"
      ADD CONSTRAINT "FK_course_teacher_id"
      FOREIGN KEY ("teacher_id") REFERENCES "users"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "homework"
      ADD CONSTRAINT "FK_homework_course_id"
      FOREIGN KEY ("course_id") REFERENCES "course"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "assignment"
      ADD CONSTRAINT "FK_assignment_homework_id"
      FOREIGN KEY ("homework_id") REFERENCES "homework"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "assignment"
      ADD CONSTRAINT "FK_assignment_student_id"
      FOREIGN KEY ("student_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "assignment" DROP CONSTRAINT "FK_assignment_student_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "assignment" DROP CONSTRAINT "FK_assignment_homework_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "homework" DROP CONSTRAINT "FK_homework_course_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "course" DROP CONSTRAINT "FK_course_teacher_id"
    `);
    await queryRunner.query(`
      DROP TABLE "assignment"
    `);
    await queryRunner.query(`
      DROP TABLE "homework"
    `);
    await queryRunner.query(`
      DROP TABLE "course"
    `);
    await queryRunner.query(`
      DROP TABLE "users"
    `);
    await queryRunner.query(`
      DROP TYPE "public"."assignment_status_enum"
    `);
    await queryRunner.query(`
      DROP TYPE "public"."assignment_source_type_enum"
    `);
    await queryRunner.query(`
      DROP TYPE "public"."users_evaluation_mode_enum"
    `);
    await queryRunner.query(`
      DROP TYPE "public"."users_role_enum"
    `);
  }
}
