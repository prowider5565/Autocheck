import type {
  Assignment,
  AuthProfile,
  Course,
  Role,
  Submission,
  User,
} from '../types';

export function getVisibleCourses(currentUser: User, courses: Course[]) {
  if (currentUser.role === 'admin') {
    return courses;
  }

  if (currentUser.role === 'teacher') {
    return courses.filter((course) => course.teacherId === currentUser.id);
  }

  return courses.filter((course) => course.studentIds.includes(currentUser.id));
}

export function canAccessCourse(user: User, course: Course) {
  if (user.role === 'admin') {
    return true;
  }

  if (user.role === 'teacher') {
    return course.teacherId === user.id;
  }

  return course.studentIds.includes(user.id);
}

export function getCoursesTitle(role: Role) {
  if (role === 'student') {
    return 'Courses you are enrolled in';
  }

  if (role === 'teacher') {
    return 'Courses you own and manage';
  }

  return 'Courses and admin controls';
}

export function getCoursesDescription(role: Role) {
  if (role === 'student') {
    return 'Open a course to review assignments, submit homework, and monitor Gemini status updates.';
  }

  if (role === 'teacher') {
    return 'Track submissions, inspect all attempts, and finalize partial Gemini reviews inside your courses.';
  }

  return 'Manage teachers, students, courses, and enrollments from a single operational dashboard.';
}

export function getStudentAssignmentSubmissions(
  submissions: Submission[],
  assignmentId: string,
  studentId: string,
) {
  return submissions
    .filter(
      (submission) =>
        submission.assignmentId === assignmentId &&
        submission.studentId === studentId,
    )
    .sort((left, right) => left.attemptNumber - right.attemptNumber);
}

export function getLatestCourseSubmissionForStudent(
  courseId: string,
  studentId: string,
  assignments: Assignment[],
  submissions: Submission[],
) {
  const assignmentIds = assignments
    .filter((assignment) => assignment.courseId === courseId)
    .map((assignment) => assignment.id);

  return submissions
    .filter(
      (submission) =>
        assignmentIds.includes(submission.assignmentId) &&
        submission.studentId === studentId,
    )
    .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt))[0];
}

export function generateEvaluationDraft(
  submission: Submission,
  assignment: Assignment,
) {
  const baseScore =
    6.5 + (submission.attemptNumber % 3) + (submission.extractedText.length % 12) / 10;
  const score = Math.min(10, Number(baseScore.toFixed(1)));
  const feedbackSource =
    assignment.evaluationMode === 'partial'
      ? 'Solid draft. Tighten the explanation and make each step easier for the teacher to verify.'
      : 'Clear response overall. Add one more precise detail to strengthen accuracy and completeness.';

  return {
    score,
    feedback: trimToSixtyWords(feedbackSource),
  };
}

export function trimToSixtyWords(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);

  return words.slice(0, 60).join(' ');
}

export function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export function mapProfileToCurrentUser(
  profile: AuthProfile | null,
  users: User[],
): User | null {
  if (!profile) {
    return null;
  }

  const matchedDemoUser = users.find(
    (user) => user.email.toLowerCase() === profile.email.toLowerCase(),
  );

  if (matchedDemoUser) {
    return {
      ...matchedDemoUser,
      fullName: profile.fullName,
      email: profile.email,
      role: profile.role,
    };
  }

  return {
    id: `api-user-${profile.id}`,
    fullName: profile.fullName,
    email: profile.email,
    role: profile.role,
  };
}
