import type {
  Assignment,
  AuthProfile,
  Course,
  DraftSignup,
  Homework,
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
  homeworks: Homework[];
  assignments: Assignment[];
  currentUser: User | null;
  currentProfile: AuthProfile | null;
  authResolved: boolean;
  authError: string | null;
  dataResolved: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  signup: (draft: DraftSignup) => Promise<void>;
  updateCurrentProfile: (payload: {
    fullName?: string;
    email?: string;
    password?: string;
    evaluationMode?: TeacherEvaluationMode;
  }) => Promise<void>;
  submitAssignment: (draft: {
    homeworkId: number;
    sourceType: SubmissionSourceType;
    extractedText: string;
    originalText?: string;
    fileName?: string;
  }) => Promise<Assignment>;
  confirmTeacherReview: (draft: {
    assignmentId: number;
    finalScore: number;
    finalFeedback: string;
  }) => Promise<Assignment>;
  createHomework: (draft: {
    courseId: number;
    description: string;
  }) => Promise<Homework>;
  createCourse: (draft: {
    title: string;
    description: string;
  }) => Promise<Course>;
  updateHomework: (homeworkId: number, draft: { description: string }) => Promise<Homework>;
  refreshCourseData: () => Promise<void>;
}
