import { EvaluationMode } from '../evaluation-mode.enum';
import { UserRole } from '../users.enum';

export class StudentProfileDto {
  id!: number;
  fullName!: string;
  email!: string;
  role!: UserRole.STUDENT;
  createdAt!: Date;
}

export class TeacherProfileDto {
  id!: number;
  fullName!: string;
  email!: string;
  role!: UserRole.TEACHER;
  evaluationMode!: EvaluationMode;
  createdAt!: Date;
}

export type ProfileDto = StudentProfileDto | TeacherProfileDto;
