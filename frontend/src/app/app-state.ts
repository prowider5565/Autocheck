import type {
  Assignment,
  AuthProfile,
  Course,
  DraftSignup,
  Submission,
  SubmissionSourceType,
  TeacherEvaluationMode,
  User,
} from '../types';

export const initialSignupDraft: DraftSignup = {
  fullName: '',
  email: '',
  role: 'student',
  password: '',
};

export interface AppState {
  users: User[];
  courses: Course[];
  assignments: Assignment[];
  submissions: Submission[];
  currentUser: User | null;
  currentProfile: AuthProfile | null;
  authResolved: boolean;
  authError: string | null;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  signup: (draft: DraftSignup) => Promise<void>;
  updateCurrentProfile: (payload: {
    fullName?: string;
    email?: string;
    password?: string;
    evaluationMode?: TeacherEvaluationMode;
  }) => Promise<void>;
  createAdminUser: (draft: DraftSignup) => void;
  createCourse: (draft: {
    title: string;
    description: string;
    teacherId: string;
  }) => void;
  updateCourse: (courseId: string, draft: Partial<Course>) => void;
  updateUser: (userId: string, draft: Partial<User>) => void;
  toggleEnrollment: (courseId: string, studentId: string) => void;
  submitAssignment: (draft: {
    assignmentId: string;
    studentId: string;
    sourceType: SubmissionSourceType;
    extractedText: string;
    originalText?: string;
    fileName?: string;
  }) => Submission;
  confirmTeacherReview: (draft: {
    submissionId: string;
    finalScore: number;
    finalFeedback: string;
  }) => void;
}
