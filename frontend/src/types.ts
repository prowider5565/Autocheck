export type Role = 'student' | 'teacher' | 'admin';

export type TeacherEvaluationMode =
  | 'ai_automated'
  | 'partial_assisted'
  | 'manual';

export type SubmissionSourceType = 'text' | 'image' | 'txt_file';

export type AssignmentStatus = 'processing' | 'review_pending' | 'graded';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface Course {
  id: number;
  title: string;
  description: string | null;
  teacherId: number;
  teacherName: string;
  createdAt?: string;
}

export interface Homework {
  id: number;
  courseId: number;
  description: string;
  createdAt: string;
}

export interface Assignment {
  id: number;
  homeworkId: number;
  studentId: number;
  attemptNumber: number;
  sourceType: SubmissionSourceType;
  status: AssignmentStatus;
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
