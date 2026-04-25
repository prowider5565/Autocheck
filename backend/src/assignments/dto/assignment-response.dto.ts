import { AssignmentSourceType, AssignmentStatus } from '../assignments.entity';

export class AssignmentResponseDto {
  id!: number;
  homeworkId!: number;
  studentId!: number;
  attemptNumber!: number;
  sourceType!: AssignmentSourceType;
  status!: AssignmentStatus;
  submittedAt!: Date;
  extractedText!: string;
  fileName!: string | null;
  originalText!: string | null;
  geminiScore!: number | null;
  geminiFeedback!: string | null;
  finalScore!: number | null;
  finalFeedback!: string | null;
  teacherEdited!: boolean;
}
