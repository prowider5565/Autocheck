import type { Assignment, User } from './types';

export const demoUsers: User[] = [
  {
    id: 1,
    fullName: 'Aida Karimova',
    email: 'admin@autocheck.dev',
    role: 'admin',
  },
  {
    id: 2,
    fullName: 'Nodir Yunusov',
    email: 'nodir@autocheck.dev',
    role: 'teacher',
  },
  {
    id: 3,
    fullName: 'Saida Ismailova',
    email: 'saida@autocheck.dev',
    role: 'teacher',
  },
  {
    id: 4,
    fullName: 'Lola Abdurakhimova',
    email: 'lola@autocheck.dev',
    role: 'student',
  },
  {
    id: 5,
    fullName: 'Temur Rakhmonov',
    email: 'temur@autocheck.dev',
    role: 'student',
  },
  {
    id: 6,
    fullName: 'Aziza Kamilova',
    email: 'aziza@autocheck.dev',
    role: 'student',
  },
];

export const demoAssignments: Assignment[] = [
  {
    id: 1,
    homeworkId: 1,
    studentId: 4,
    attemptNumber: 1,
    sourceType: 'text',
    status: 'graded',
    submittedAt: '2026-04-23T08:12:00.000Z',
    extractedText:
      'To solve a quadratic equation, I first identify the coefficients, then apply factorization or the quadratic formula. Example: x^2 + 5x + 6 = 0 becomes (x+2)(x+3)=0.',
    originalText:
      'To solve a quadratic equation, I first identify the coefficients, then apply factorization or the quadratic formula. Example: x^2 + 5x + 6 = 0 becomes (x+2)(x+3)=0.',
    geminiScore: 8.5,
    geminiFeedback:
      'Good explanation and example. Show why each factor leads to a root.',
    finalScore: 8.5,
    finalFeedback:
      'Good explanation and example. Show why each factor leads to a root.',
    teacherEdited: false,
  },
  {
    id: 2,
    homeworkId: 2,
    studentId: 5,
    attemptNumber: 1,
    sourceType: 'image',
    status: 'review_pending',
    submittedAt: '2026-04-23T10:24:00.000Z',
    extractedText:
      'I factored the first expression into (x + 4)(x - 2) and the second into (y + 1)(y + 5), but I need to justify the middle term split more clearly.',
    fileName: 'factorization-notes.png',
    geminiScore: 7,
    geminiFeedback:
      'Reasoning is partly correct. Clarify how the middle term was split in each example.',
    teacherEdited: false,
  },
  {
    id: 3,
    homeworkId: 3,
    studentId: 4,
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
    id: 4,
    homeworkId: 4,
    studentId: 6,
    attemptNumber: 1,
    sourceType: 'text',
    status: 'graded',
    submittedAt: '2026-04-22T09:10:00.000Z',
    extractedText:
      'The event grew from economic pressure and political mistrust, and it later changed how regional alliances were formed.',
    originalText:
      'The event grew from economic pressure and political mistrust, and it later changed how regional alliances were formed.',
    geminiScore: 9,
    geminiFeedback:
      'Clear summary with good structure. Add one concrete example for stronger evidence.',
    finalScore: 9,
    finalFeedback:
      'Clear summary with good structure. Add one concrete example for stronger evidence.',
    teacherEdited: false,
  },
];
