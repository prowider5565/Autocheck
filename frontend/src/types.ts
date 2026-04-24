export type Role = 'student' | 'teacher' | 'admin';

export type EvaluationMode = 'automatic' | 'partial';
export type TeacherEvaluationMode =
  | 'ai_automated'
  | 'partial_assisted'
  | 'manual';

export type SubmissionSourceType = 'text' | 'image' | 'txt_file';

export type SubmissionStatus = 'processing' | 'review_pending' | 'graded';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  studentIds: string[];
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  instructions: string;
  evaluationMode: EvaluationMode;
  maxAttempts: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  attemptNumber: number;
  sourceType: SubmissionSourceType;
  status: SubmissionStatus;
  submittedAt: string;
  extractedText: string;
  fileName?: string;
  originalText?: string;
  geminiScore?: number;
  geminiFeedback?: string;
  finalScore?: number;
  finalFeedback?: string;
  teacherEdited: boolean;
}

export interface DraftSignup {
  fullName: string;
  email: string;
  role: Extract<Role, 'student' | 'teacher'>;
  password: string;
}

export interface AuthStudentProfile {
  id: number;
  fullName: string;
  email: string;
  role: 'student';
  createdAt: string;
}

export interface AuthTeacherProfile {
  id: number;
  fullName: string;
  email: string;
  role: 'teacher';
  evaluationMode: TeacherEvaluationMode;
  createdAt: string;
}

export type AuthProfile = AuthStudentProfile | AuthTeacherProfile;
