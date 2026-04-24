import type {
  Assignment,
  Course,
  Submission,
  User,
} from './types';

export const demoUsers: User[] = [
  {
    id: 'admin-1',
    fullName: 'Aida Karimova',
    email: 'admin@autocheck.dev',
    role: 'admin',
  },
  {
    id: 'teacher-1',
    fullName: 'Nodir Yunusov',
    email: 'nodir@autocheck.dev',
    role: 'teacher',
  },
  {
    id: 'teacher-2',
    fullName: 'Saida Ismailova',
    email: 'saida@autocheck.dev',
    role: 'teacher',
  },
  {
    id: 'student-1',
    fullName: 'Lola Abdurakhimova',
    email: 'lola@autocheck.dev',
    role: 'student',
  },
  {
    id: 'student-2',
    fullName: 'Temur Rakhmonov',
    email: 'temur@autocheck.dev',
    role: 'student',
  },
  {
    id: 'student-3',
    fullName: 'Aziza Kamilova',
    email: 'aziza@autocheck.dev',
    role: 'student',
  },
];

export const demoCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Algebra Foundations',
    description: 'Core algebra practice for first-year students.',
    teacherId: 'teacher-1',
    studentIds: ['student-1', 'student-2'],
  },
  {
    id: 'course-2',
    title: 'Academic Writing',
    description: 'Short-form analytical writing with structured feedback.',
    teacherId: 'teacher-2',
    studentIds: ['student-1', 'student-3'],
  },
  {
    id: 'course-3',
    title: 'World History',
    description: 'Evidence-based historical reasoning and concise responses.',
    teacherId: 'teacher-1',
    studentIds: ['student-2', 'student-3'],
  },
];

export const demoAssignments: Assignment[] = [
  {
    id: 'assignment-1',
    courseId: 'course-1',
    title: 'Quadratic Equation Reflection',
    instructions:
      'Explain how you solve a quadratic equation and provide one worked example in your own words.',
    evaluationMode: 'automatic',
    maxAttempts: 3,
  },
  {
    id: 'assignment-2',
    courseId: 'course-1',
    title: 'Factorization Challenge',
    instructions:
      'Factor the given expressions and justify each step so the reasoning is easy to follow.',
    evaluationMode: 'partial',
    maxAttempts: 3,
  },
  {
    id: 'assignment-3',
    courseId: 'course-2',
    title: 'Argument Paragraph Draft',
    instructions:
      'Write one structured paragraph with a clear claim, evidence, and concluding sentence.',
    evaluationMode: 'partial',
    maxAttempts: 3,
  },
  {
    id: 'assignment-4',
    courseId: 'course-3',
    title: 'Cause and Effect Summary',
    instructions:
      'Summarize one historical event and explain two causes and one outcome clearly.',
    evaluationMode: 'automatic',
    maxAttempts: 3,
  },
];

export const demoSubmissions: Submission[] = [
  {
    id: 'submission-1',
    assignmentId: 'assignment-1',
    studentId: 'student-1',
    attemptNumber: 1,
    sourceType: 'text',
    status: 'graded',
    submittedAt: '2026-04-23T08:12:00.000Z',
    extractedText:
      'To solve a quadratic equation, I first identify the coefficients, then apply factorization or the quadratic formula. Example: x^2 + 5x + 6 = 0 becomes (x+2)(x+3)=0.',
    originalText:
      'To solve a quadratic equation, I first identify the coefficients, then apply factorization or the quadratic formula. Example: x^2 + 5x + 6 = 0 becomes (x+2)(x+3)=0.',
    geminiScore: 8.5,
    geminiFeedback: 'Good explanation and example. Show why each factor leads to a root.',
    finalScore: 8.5,
    finalFeedback: 'Good explanation and example. Show why each factor leads to a root.',
    teacherEdited: false,
  },
  {
    id: 'submission-2',
    assignmentId: 'assignment-2',
    studentId: 'student-2',
    attemptNumber: 1,
    sourceType: 'image',
    status: 'review_pending',
    submittedAt: '2026-04-23T10:24:00.000Z',
    extractedText:
      'I factored the first expression into (x + 4)(x - 2) and the second into (y + 1)(y + 5), but I need to justify the middle term split more clearly.',
    fileName: 'factorization-notes.png',
    geminiScore: 7,
    geminiFeedback: 'Reasoning is partly correct. Clarify how the middle term was split in each example.',
    teacherEdited: false,
  },
  {
    id: 'submission-3',
    assignmentId: 'assignment-3',
    studentId: 'student-1',
    attemptNumber: 1,
    sourceType: 'txt_file',
    status: 'processing',
    submittedAt: '2026-04-23T11:42:00.000Z',
    extractedText:
      'Uniforms should remain optional because students learn better when they feel comfortable expressing themselves.',
    fileName: 'argument-draft.txt',
    teacherEdited: false,
  },
  {
    id: 'submission-4',
    assignmentId: 'assignment-4',
    studentId: 'student-3',
    attemptNumber: 1,
    sourceType: 'text',
    status: 'graded',
    submittedAt: '2026-04-22T09:10:00.000Z',
    extractedText:
      'The event grew from economic pressure and political mistrust, and it later changed how regional alliances were formed.',
    originalText:
      'The event grew from economic pressure and political mistrust, and it later changed how regional alliances were formed.',
    geminiScore: 9,
    geminiFeedback: 'Clear summary with good structure. Add one concrete example for stronger evidence.',
    finalScore: 9,
    finalFeedback: 'Clear summary with good structure. Add one concrete example for stronger evidence.',
    teacherEdited: false,
  },
];
